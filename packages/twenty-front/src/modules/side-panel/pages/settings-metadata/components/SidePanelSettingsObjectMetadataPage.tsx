import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconList, useIcons } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { SettingsObjectFieldDataType } from '@/settings/data-model/object-details/components/SettingsObjectFieldDataType';
import { isFieldTypeSupportedInSettings } from '@/settings/data-model/utils/isFieldTypeSupportedInSettings';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { useOpenRecordsInSidePanel } from '@/side-panel/hooks/useOpenRecordsInSidePanel';
import { useOpenSettingsFieldMetadataInSidePanel } from '@/side-panel/hooks/useOpenSettingsFieldMetadataInSidePanel';
import { SidePanelSettingsMetadataSummary } from '@/side-panel/pages/settings-metadata/components/SidePanelSettingsMetadataSummary';
import { viewableObjectMetadataIdComponentState } from '@/side-panel/pages/settings-metadata/states/viewableObjectMetadataIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const PROPOSED_OBJECT_ICON = 'IconTable';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[2]};
`;

export const SidePanelSettingsObjectMetadataPage = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { openRecordsInSidePanel } = useOpenRecordsInSidePanel();
  const { openSettingsFieldMetadataInSidePanel } =
    useOpenSettingsFieldMetadataInSidePanel();

  const viewableObjectMetadataId = useAtomComponentStateValue(
    viewableObjectMetadataIdComponentState,
  );
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );

  const objectMetadataItem = isDefined(viewableObjectMetadataId)
    ? objectMetadataItemsByIdMap.get(viewableObjectMetadataId)
    : undefined;

  const settingsFields = useMemo(
    () =>
      (objectMetadataItem?.fields ?? [])
        .filter(
          (fieldMetadataItem) =>
            fieldMetadataItem.isActive && !fieldMetadataItem.isSystem,
        )
        .flatMap((fieldMetadataItem) =>
          isFieldTypeSupportedInSettings(fieldMetadataItem.type)
            ? [{ fieldMetadataItem, fieldType: fieldMetadataItem.type }]
            : [],
        )
        .sort((firstField, secondField) =>
          firstField.fieldMetadataItem.label.localeCompare(
            secondField.fieldMetadataItem.label,
          ),
        ),
    [objectMetadataItem],
  );

  if (!isDefined(objectMetadataItem)) {
    return null;
  }

  const ObjectIcon = getIcon(objectMetadataItem.icon, PROPOSED_OBJECT_ICON);

  return (
    <StyledContainer>
      <SidePanelSettingsMetadataSummary
        Icon={ObjectIcon}
        label={objectMetadataItem.labelPlural}
        apiName={objectMetadataItem.namePlural}
        description={objectMetadataItem.description}
      />
      <SidePanelGroup heading={t`Records`}>
        <MenuItem
          LeftIcon={IconList}
          text={t`See ${objectMetadataItem.labelPlural}`}
          onClick={() =>
            openRecordsInSidePanel({
              objectNameSingular: objectMetadataItem.nameSingular,
            })
          }
        />
      </SidePanelGroup>
      <SidePanelGroup heading={t`Fields`}>
        {settingsFields.map(({ fieldMetadataItem, fieldType }) => (
          <MenuItem
            key={fieldMetadataItem.id}
            LeftIcon={getIcon(fieldMetadataItem.icon)}
            text={fieldMetadataItem.label}
            RightComponent={<SettingsObjectFieldDataType value={fieldType} />}
            onClick={() =>
              openSettingsFieldMetadataInSidePanel({
                fieldMetadataId: fieldMetadataItem.id,
              })
            }
          />
        ))}
      </SidePanelGroup>
    </StyledContainer>
  );
};
