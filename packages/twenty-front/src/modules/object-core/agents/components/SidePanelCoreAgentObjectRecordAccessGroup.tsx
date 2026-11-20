import { SidePanelCoreAgentRecordAccessGroup } from '@/object-core/agents/components/SidePanelCoreAgentRecordAccessGroup';
import { type CoreAgentRecordAccessLevel } from '@/object-core/agents/types/CoreAgentRecordAccessLevel';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useObjectDisabledOperations } from '@/settings/roles/role-permissions/object-overrides/hooks/useObjectDisabledOperations';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

type SidePanelCoreAgentObjectRecordAccessGroupProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  role: RoleWithPartialMembers | undefined;
  isReadOnly: boolean;
  onLevelChange: ({
    level,
    isEnabled,
  }: {
    level: CoreAgentRecordAccessLevel;
    isEnabled: boolean;
  }) => void;
};

export const SidePanelCoreAgentObjectRecordAccessGroup = ({
  objectMetadataItem,
  role,
  isReadOnly,
  onLevelChange,
}: SidePanelCoreAgentObjectRecordAccessGroupProps) => {
  const { disabledOperations, disabledOperationReasons } =
    useObjectDisabledOperations(objectMetadataItem);

  return (
    <SidePanelCoreAgentRecordAccessGroup
      heading={objectMetadataItem.labelPlural}
      objectIcon={
        <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
      }
      role={role}
      objectMetadataId={objectMetadataItem.id}
      disabledOperations={disabledOperations}
      disabledOperationReasons={disabledOperationReasons}
      isReadOnly={isReadOnly}
      onLevelChange={onLevelChange}
    />
  );
};
