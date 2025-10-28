import { type PropsWithChildren, useEffect, useState } from 'react';

import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import {
  type ContextStoreTargetedRecordsRule,
  contextStoreTargetedRecordsRuleComponentState,
} from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { type ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

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
  const setContextStoreTargetedRecordsRule = useSetRecoilComponentState(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const setContextStoreCurrentObjectMetadataItemId = useSetRecoilComponentState(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const setContextStoreNumberOfSelectedRecords = useSetRecoilComponentState(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const setcontextStoreFiltersComponentState = useSetRecoilComponentState(
    contextStoreFiltersComponentState,
  );

  const setContextStoreFilterGroupsComponentState = useSetRecoilComponentState(
    contextStoreFilterGroupsComponentState,
  );

  const setContextStoreCurrentViewId = useSetRecoilComponentState(
    contextStoreCurrentViewIdComponentState,
  );

  const setContextStoreCurrentViewType = useSetRecoilComponentState(
    contextStoreCurrentViewTypeComponentState,
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
    setcontextStoreFiltersComponentState(contextStoreFilters);
    setContextStoreFilterGroupsComponentState(contextStoreFilterGroups);
    setContextStoreCurrentViewType(contextStoreCurrentViewType ?? null);
    setIsLoaded(true);
  }, [
    setContextStoreTargetedRecordsRule,
    setContextStoreCurrentObjectMetadataItemId,
    contextStoreTargetedRecordsRule,
    contextStoreCurrentObjectMetadataId,
    setContextStoreNumberOfSelectedRecords,
    contextStoreNumberOfSelectedRecords,
    setcontextStoreFiltersComponentState,
    contextStoreFilters,
    objectMetadataItem,
    setContextStoreCurrentViewId,
    contextStoreCurrentViewId,
    setContextStoreCurrentViewType,
    contextStoreCurrentViewType,
    setContextStoreFilterGroupsComponentState,
    contextStoreFilterGroups,
  ]);

  return isLoaded ? <>{children}</> : null;
};
