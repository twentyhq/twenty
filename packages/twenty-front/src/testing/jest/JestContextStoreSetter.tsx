import { PropsWithChildren, useEffect, useState } from 'react';

import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import {
  ContextStoreTargetedRecordsRule,
  contextStoreTargetedRecordsRuleComponentState,
} from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { mainContextStoreComponentInstanceIdState } from '@/context-store/states/mainContextStoreComponentInstanceId';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useSetRecoilState } from 'recoil';

export type JestContextStoreSetterMocks = {
  contextStoreTargetedRecordsRule?: ContextStoreTargetedRecordsRule;
  contextStoreNumberOfSelectedRecords?: number;
  contextStoreFilters?: RecordFilter[];
  contextStoreCurrentObjectMetadataNameSingular?: string;
  contextStoreCurrentViewId?: string;
  componentInstanceId: string;
};

type JestContextStoreSetterProps =
  PropsWithChildren<JestContextStoreSetterMocks>;
export const JestContextStoreSetter = ({
  contextStoreTargetedRecordsRule = {
    mode: 'selection',
    selectedRecordIds: [],
  },
  contextStoreNumberOfSelectedRecords = 0,
  contextStoreCurrentObjectMetadataNameSingular = '',
  contextStoreFilters = [],
  children,
  contextStoreCurrentViewId = '1',
  componentInstanceId,
}: JestContextStoreSetterProps) => {
  const setContextStoreTargetedRecordsRule = useSetRecoilComponentStateV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const setContextStoreCurrentObjectMetadataId = useSetRecoilComponentStateV2(
    contextStoreCurrentObjectMetadataIdComponentState,
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

  const setMainContextStoreComponentInstanceId = useSetRecoilState(
    mainContextStoreComponentInstanceIdState,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: contextStoreCurrentObjectMetadataNameSingular,
  });

  const contextStoreCurrentObjectMetadataId = objectMetadataItem.id;

  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setContextStoreTargetedRecordsRule(contextStoreTargetedRecordsRule);
    setContextStoreCurrentObjectMetadataId(contextStoreCurrentObjectMetadataId);
    setContextStoreNumberOfSelectedRecords(contextStoreNumberOfSelectedRecords);
    setcontextStoreFiltersComponentState(contextStoreFilters);
    setContextStoreCurrentViewId(contextStoreCurrentViewId);
    setMainContextStoreComponentInstanceId(componentInstanceId);

    setIsLoaded(true);
  }, [
    setContextStoreTargetedRecordsRule,
    setContextStoreCurrentObjectMetadataId,
    contextStoreTargetedRecordsRule,
    contextStoreCurrentObjectMetadataId,
    setContextStoreNumberOfSelectedRecords,
    contextStoreNumberOfSelectedRecords,
    setcontextStoreFiltersComponentState,
    contextStoreFilters,
    setContextStoreCurrentViewId,
    contextStoreCurrentViewId,
    setMainContextStoreComponentInstanceId,
    componentInstanceId,
  ]);

  return isLoaded ? <>{children}</> : null;
};
