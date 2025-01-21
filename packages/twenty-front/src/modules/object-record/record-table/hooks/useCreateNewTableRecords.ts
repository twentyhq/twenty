import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { DEFAULT_CELL_SCOPE } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellV2';
import { useSelectedTableCellEditMode } from '@/object-record/record-table/record-table-cell/hooks/useSelectedTableCellEditMode';
import { recordTablePendingRecordIdByGroupComponentFamilyState } from '@/object-record/record-table/states/recordTablePendingRecordIdByGroupComponentFamilyState';
import { recordTablePendingRecordIdComponentState } from '@/object-record/record-table/states/recordTablePendingRecordIdComponentState';
import { isUpdatingRecordEditableName } from '@/object-record/states/isUpdatingRecordEditableName';
import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useNavigate } from 'react-router-dom';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';
import { FeatureFlagKey } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

export const useCreateNewTableRecord = ({
  objectMetadataItem,
  recordTableId,
}: {
  objectMetadataItem: ObjectMetadataItem;
  recordTableId: string;
}) => {
  const { setSelectedTableCellEditMode } = useSelectedTableCellEditMode({
    scopeId: recordTableId,
  });

  const setHotkeyScope = useSetHotkeyScope();

  const setPendingRecordId = useSetRecoilComponentStateV2(
    recordTablePendingRecordIdComponentState,
    recordTableId,
  );

  const recordTablePendingRecordIdByGroupFamilyState =
    useRecoilComponentCallbackStateV2(
      recordTablePendingRecordIdByGroupComponentFamilyState,
      recordTableId,
    );

  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();

  const { openRecordInCommandMenu } = useCommandMenu();

  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
    shouldMatchRootQueryFilter: true,
  });

  const navigate = useNavigate();

  const createNewTableRecord = useRecoilCallback(
    ({ set }) =>
      async () => {
        const recordId = v4();

        if (isCommandMenuV2Enabled) {
          // TODO: Generalize this behaviour, there will be a view setting to specify
          // if the new record should be displayed in the side panel or on the record page
          if (
            objectMetadataItem.nameSingular === CoreObjectNameSingular.Workflow
          ) {
            await createOneRecord({
              id: recordId,
              name: 'Untitled',
            });
            navigate(`/object/workflow/${recordId}`);
            set(
              isUpdatingRecordEditableName.atomFamily({
                instanceId: recordId,
              }),
              true,
            );
            return;
          }

          await createOneRecord({ id: recordId });
          openRecordInCommandMenu(recordId, objectMetadataItem.nameSingular);

          return;
        }

        setPendingRecordId(recordId);
        setSelectedTableCellEditMode(-1, 0);
        setHotkeyScope(
          DEFAULT_CELL_SCOPE.scope,
          DEFAULT_CELL_SCOPE.customScopes,
        );

        if (isDefined(objectMetadataItem.labelIdentifierFieldMetadataId)) {
          setActiveDropdownFocusIdAndMemorizePrevious(
            getDropdownFocusIdForRecordField(
              recordId,
              objectMetadataItem.labelIdentifierFieldMetadataId,
              'table-cell',
            ),
          );
        }
      },
    [
      createOneRecord,
      isCommandMenuV2Enabled,
      navigate,
      objectMetadataItem.labelIdentifierFieldMetadataId,
      objectMetadataItem.nameSingular,
      openRecordInCommandMenu,
      setActiveDropdownFocusIdAndMemorizePrevious,
      setHotkeyScope,
      setPendingRecordId,
      setSelectedTableCellEditMode,
    ],
  );

  const createNewTableRecordInGroup = useRecoilCallback(
    ({ set }) =>
      (recordGroupId: string) => {
        const recordId = v4();

        set(
          recordTablePendingRecordIdByGroupFamilyState(recordGroupId),
          recordId,
        );
        setSelectedTableCellEditMode(-1, 0);
        setHotkeyScope(
          DEFAULT_CELL_SCOPE.scope,
          DEFAULT_CELL_SCOPE.customScopes,
        );

        if (isDefined(objectMetadataItem.labelIdentifierFieldMetadataId)) {
          setActiveDropdownFocusIdAndMemorizePrevious(
            getDropdownFocusIdForRecordField(
              recordId,
              objectMetadataItem.labelIdentifierFieldMetadataId,
              'table-cell',
            ),
          );
        }
      },
    [
      objectMetadataItem,
      recordTablePendingRecordIdByGroupFamilyState,
      setActiveDropdownFocusIdAndMemorizePrevious,
      setHotkeyScope,
      setSelectedTableCellEditMode,
    ],
  );

  return {
    createNewTableRecord,
    createNewTableRecordInGroup,
  };
};
