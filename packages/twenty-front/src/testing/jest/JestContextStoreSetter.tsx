import { ReactNode, useEffect, useState } from 'react';

import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import {
  ContextStoreTargetedRecordsRule,
  contextStoreTargetedRecordsRuleComponentState,
} from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

export const JestContextStoreSetter = ({
  contextStoreTargetedRecordsRule = {
    mode: 'selection',
    selectedRecordIds: [],
  },
  contextStoreNumberOfSelectedRecords = 0,
  contextStoreCurrentObjectMetadataNameSingular = '',
  children,
}: {
  contextStoreTargetedRecordsRule?: ContextStoreTargetedRecordsRule;
  contextStoreNumberOfSelectedRecords?: number;
  contextStoreCurrentObjectMetadataNameSingular?: string;
  children: ReactNode;
}) => {
  const setContextStoreTargetedRecordsRule = useSetRecoilComponentStateV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const setContextStoreCurrentObjectMetadataId = useSetRecoilComponentStateV2(
    contextStoreCurrentObjectMetadataIdComponentState,
  );

  const setContextStoreNumberOfSelectedRecords = useSetRecoilComponentStateV2(
    contextStoreNumberOfSelectedRecordsComponentState,
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
    setIsLoaded(true);
  }, [
    setContextStoreTargetedRecordsRule,
    setContextStoreCurrentObjectMetadataId,
    contextStoreTargetedRecordsRule,
    contextStoreCurrentObjectMetadataId,
    setContextStoreNumberOfSelectedRecords,
    contextStoreNumberOfSelectedRecords,
  ]);

  return isLoaded ? <>{children}</> : null;
};
