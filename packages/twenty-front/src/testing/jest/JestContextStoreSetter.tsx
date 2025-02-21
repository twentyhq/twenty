import { PropsWithChildren, useEffect, useState } from 'react';

import { contextStoreCurrentObjectMetadataItemComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import {
  ContextStoreTargetedRecordsRule,
  contextStoreTargetedRecordsRuleComponentState,
} from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

export type JestContextStoreSetterMocks = {
  contextStoreTargetedRecordsRule?: ContextStoreTargetedRecordsRule;
  contextStoreNumberOfSelectedRecords?: number;
  contextStoreFilters?: RecordFilter[];
  contextStoreCurrentObjectMetadataNameSingular?: string;
};

type JestContextStoreSetterProps =
  PropsWithChildren<JestContextStoreSetterMocks>;
export const JestContextStoreSetter = ({
  contextStoreTargetedRecordsRule = {
    mode: 'selection',
    selectedRecordIds: [],
  },
  contextStoreNumberOfSelectedRecords = 0,
  contextStoreCurrentObjectMetadataNameSingular = 'company',
  contextStoreFilters = [],
  children,
}: JestContextStoreSetterProps) => {
  const setContextStoreTargetedRecordsRule = useSetRecoilComponentStateV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const setContextStoreCurrentObjectMetadataItem = useSetRecoilComponentStateV2(
    contextStoreCurrentObjectMetadataItemComponentState,
  );

  const setContextStoreNumberOfSelectedRecords = useSetRecoilComponentStateV2(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const setcontextStoreFiltersComponentState = useSetRecoilComponentStateV2(
    contextStoreFiltersComponentState,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: contextStoreCurrentObjectMetadataNameSingular,
  });

  const contextStoreCurrentObjectMetadataId = objectMetadataItem.id;

  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setContextStoreTargetedRecordsRule(contextStoreTargetedRecordsRule);
    setContextStoreCurrentObjectMetadataItem(objectMetadataItem);
    setContextStoreNumberOfSelectedRecords(contextStoreNumberOfSelectedRecords);
    setcontextStoreFiltersComponentState(contextStoreFilters);

    setIsLoaded(true);
  }, [
    setContextStoreTargetedRecordsRule,
    setContextStoreCurrentObjectMetadataItem,
    contextStoreTargetedRecordsRule,
    contextStoreCurrentObjectMetadataId,
    setContextStoreNumberOfSelectedRecords,
    contextStoreNumberOfSelectedRecords,
    setcontextStoreFiltersComponentState,
    contextStoreFilters,
    objectMetadataItem,
  ]);

  return isLoaded ? <>{children}</> : null;
};
