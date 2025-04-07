import { RegisterRecordActionEffect } from '@/action-menu/actions/record-actions/components/RegisterRecordActionEffect';
import { useRegisteredRecordActions } from '@/action-menu/hooks/useRegisteredRecordActions';
import { useShouldActionBeRegisteredParams } from '@/action-menu/hooks/useShouldActionBeRegisteredParams';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';

type RegisterWorkflowRecordActionEffectsProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const RegisterWorkflowRecordActionEffects = ({
  objectMetadataItem,
}: RegisterWorkflowRecordActionEffectsProps) => {
  const shouldBeRegisteredParams = useShouldActionBeRegisteredParams({
    objectMetadataItem,
  });

  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const recordId =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds[0]
      : undefined;

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);

  const actionsToRegister = useRegisteredRecordActions({
    objectMetadataItem,
    shouldBeRegisteredParams: {
      ...shouldBeRegisteredParams,
      workflowWithCurrentVersion,
    },
  });

  return (
    <>
      {actionsToRegister.map((action) => (
        <RegisterRecordActionEffect
          key={action.key}
          action={action}
          objectMetadataItem={objectMetadataItem}
        />
      ))}
    </>
  );
};
