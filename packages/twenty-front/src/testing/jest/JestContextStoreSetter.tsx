import { type PropsWithChildren, useContext, useEffect, useState } from 'react';

import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import {
  type ContextStoreTargetedRecordsRule,
  contextStoreTargetedRecordsRuleComponentState,
} from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { type ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

export type JestContextStoreSetterMocks = {
  contextStoreTargetedRecordsRule?: ContextStoreTargetedRecordsRule;
  contextStoreNumberOfSelectedRecords?: number;
  contextStoreFilters?: RecordFilter[];
  contextStoreFilterGroups?: RecordFilterGroup[];
  contextStoreCurrentObjectMetadataNameSingular?: string;
  contextStoreCurrentViewId?: string;
  contextStoreCurrentViewType?: ContextStoreViewType;
};

type JestContextStoreSetterProps =
  PropsWithChildren<JestContextStoreSetterMocks>;
export const JestContextStoreSetter = ({
  contextStoreCurrentViewId,
  contextStoreTargetedRecordsRule = {
    mode: 'selection',
    selectedRecordIds: [],
  },
  contextStoreNumberOfSelectedRecords = 0,
  contextStoreCurrentObjectMetadataNameSingular = 'company',
  contextStoreFilters = [],
  contextStoreFilterGroups = [],
  contextStoreCurrentViewType,
  children,
}: JestContextStoreSetterProps) => {
  const contextStoreInstanceContext = useContext(
    ContextStoreComponentInstanceContext,
  );
  const instanceId =
    contextStoreInstanceContext?.instanceId ?? MAIN_CONTEXT_STORE_INSTANCE_ID;

  const setContextStoreTargetedRecordsRule = useSetAtomComponentState(
    contextStoreTargetedRecordsRuleComponentState,
    instanceId,
  );

  const setContextStoreCurrentObjectMetadataItemId = useSetAtomComponentState(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    instanceId,
  );

  const setContextStoreNumberOfSelectedRecords = useSetAtomComponentState(
    contextStoreNumberOfSelectedRecordsComponentState,
    instanceId,
  );

  const setContextStoreFilters = useSetAtomComponentState(
    contextStoreFiltersComponentState,
    instanceId,
  );

  const setContextStoreFilterGroups = useSetAtomComponentState(
    contextStoreFilterGroupsComponentState,
    instanceId,
  );

  const setContextStoreCurrentViewId = useSetAtomComponentState(
    contextStoreCurrentViewIdComponentState,
    instanceId,
  );

  const setContextStoreCurrentViewType = useSetAtomComponentState(
    contextStoreCurrentViewTypeComponentState,
    instanceId,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: contextStoreCurrentObjectMetadataNameSingular,
  });

  const contextStoreCurrentObjectMetadataId = objectMetadataItem.id;

  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setContextStoreCurrentViewId(contextStoreCurrentViewId);
    setContextStoreTargetedRecordsRule(contextStoreTargetedRecordsRule);
    setContextStoreCurrentObjectMetadataItemId(objectMetadataItem.id);
    setContextStoreNumberOfSelectedRecords(contextStoreNumberOfSelectedRecords);
    setContextStoreFilters(contextStoreFilters);
    setContextStoreFilterGroups(contextStoreFilterGroups);
    setContextStoreCurrentViewType(contextStoreCurrentViewType ?? null);
    setIsLoaded(true);
  }, [
    setContextStoreTargetedRecordsRule,
    setContextStoreCurrentObjectMetadataItemId,
    contextStoreTargetedRecordsRule,
    contextStoreCurrentObjectMetadataId,
    setContextStoreNumberOfSelectedRecords,
    contextStoreNumberOfSelectedRecords,
    setContextStoreFilters,
    contextStoreFilters,
    objectMetadataItem,
    setContextStoreCurrentViewId,
    contextStoreCurrentViewId,
    setContextStoreCurrentViewType,
    contextStoreCurrentViewType,
    setContextStoreFilterGroups,
    contextStoreFilterGroups,
  ]);

  return isLoaded ? <>{children}</> : null;
};
