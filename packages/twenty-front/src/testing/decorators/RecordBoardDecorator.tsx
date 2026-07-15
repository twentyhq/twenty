import { type Decorator } from '@storybook/react-vite';
import { useEffect, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { type View } from '@/views/types/View';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const BoardStateLoaderEffect = ({
  view,
  objectMetadataItem,
}: {
  view: View;
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  const { loadRecordIndexStates } = useLoadRecordIndexStates();

  const setRecordIndexShouldHideEmptyRecordGroups = useSetAtomComponentState(
    recordIndexShouldHideEmptyRecordGroupsComponentState,
  );

  useEffect(() => {
    loadRecordIndexStates(view, objectMetadataItem);
    // Show every group even without seeded records so columns render.
    setRecordIndexShouldHideEmptyRecordGroups(false);
    setTestViewsInMetadataStore(jotaiStore, [
      view as unknown as ViewWithRelations,
    ]);
  }, [
    loadRecordIndexStates,
    view,
    objectMetadataItem,
    setRecordIndexShouldHideEmptyRecordGroups,
  ]);

  return null;
};

const BoardContextProviders = ({
  view,
  objectMetadataItem,
  recordBoardId,
  children,
}: {
  view: View;
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordBoardId: string;
  children: React.ReactNode;
}) => {
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const selectFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === view.mainGroupByFieldMetadataId,
  );

  if (!isDefined(selectFieldMetadataItem)) {
    throw new Error(
      'Group-by field not found while loading RecordBoardDecorator',
    );
  }

  return (
    <RecordBoardContext.Provider
      value={{
        objectMetadataItem,
        selectFieldMetadataItem,
        createOneRecord: () => {},
        updateOneRecord: () => {},
        deleteOneRecord: () => Promise.resolve(),
        recordBoardId,
        objectPermissions: getObjectPermissionsFromMapByObjectMetadataId({
          objectPermissionsByObjectMetadataId,
          objectMetadataId: objectMetadataItem.id,
        }),
      }}
    >
      <RecordBoardComponentInstanceContext.Provider
        value={{ instanceId: recordBoardId }}
      >
        {children}
      </RecordBoardComponentInstanceContext.Provider>
    </RecordBoardContext.Provider>
  );
};

export const RecordBoardDecorator: Decorator = (Story, context) => {
  const {
    recordBoardObjectNameSingular: objectNameSingular,
    recordBoardViewName: viewName,
  } = context.parameters;

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === objectNameSingular,
  );

  if (!isDefined(objectMetadataItem)) {
    throw new Error(
      'Object metadata item not found while loading RecordBoardDecorator',
    );
  }

  const view = useMemo(
    () => mockedViews.find((v) => v.name === viewName) as unknown as View,
    [viewName],
  );

  const recordBoardId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectMetadataItem.namePlural,
    view.id,
  );

  return (
    <ScrollWrapperComponentInstanceContext.Provider
      value={{ instanceId: recordBoardId }}
    >
      <ViewComponentInstanceContext.Provider
        value={{ instanceId: recordBoardId }}
      >
        <RecordComponentInstanceContextsWrapper
          componentInstanceId={recordBoardId}
        >
          <BoardContextProviders
            view={view}
            objectMetadataItem={objectMetadataItem}
            recordBoardId={recordBoardId}
          >
            <BoardStateLoaderEffect
              view={view}
              objectMetadataItem={objectMetadataItem}
            />
            <Story />
          </BoardContextProviders>
        </RecordComponentInstanceContextsWrapper>
      </ViewComponentInstanceContext.Provider>
    </ScrollWrapperComponentInstanceContext.Provider>
  );
};
