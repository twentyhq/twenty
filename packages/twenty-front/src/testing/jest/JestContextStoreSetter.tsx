import { PropsWithChildren, useEffect, useState } from 'react';

import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import {
  ContextStoreTargetedRecordsRule,
  contextStoreTargetedRecordsRuleComponentState,
} from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

export type JestContextStoreSetterMocks = {
  contextStoreTargetedRecordsRule?: ContextStoreTargetedRecordsRule;
  contextStoreNumberOfSelectedRecords?: number;
  contextStoreFilters?: RecordFilter[];
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
  contextStoreCurrentViewType,
  children,
}: JestContextStoreSetterProps) => {
  const setContextStoreTargetedRecordsRule = useSetRecoilComponentStateV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const setContextStoreCurrentObjectMetadataItemId =
    useSetRecoilComponentStateV2(
      contextStoreCurrentObjectMetadataItemIdComponentState,
    );

  const setContextStoreNumberOfSelectedRecords = useSetRecoilComponentStateV2(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const setcontextStoreFiltersComponentState = useSetRecoilComponentStateV2(
    contextStoreFiltersComponentState,
  );

  const setContextStoreCurrentViewId = useSetRecoilComponentStateV2(
    contextStoreCurrentViewIdComponentState,
  );

  const setContextStoreCurrentViewType = useSetRecoilComponentStateV2(
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
  ]);

  return isLoaded ? <>{children}</> : null;
};
