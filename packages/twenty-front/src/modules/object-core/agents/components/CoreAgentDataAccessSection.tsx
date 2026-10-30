import { useLingui } from '@lingui/react/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { Section } from 'twenty-ui/components/layout';
import { IconEdit, IconLock } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useTheme } from 'twenty-ui/theme';

import { CoreAgentSectionList } from '@/object-core/agents/components/CoreAgentSectionList';
import { CoreAgentSectionBody } from '@/object-core/agents/components/CoreAgentSectionBody';
import { CORE_AGENT_RECORD_ACCESS_LEVELS } from '@/object-core/agents/constants/CoreAgentRecordAccessLevels';
import { useCoreAgentRole } from '@/object-core/agents/hooks/useCoreAgentRole';
import { useOpenCoreAgentSidePanelPage } from '@/object-core/agents/hooks/useOpenCoreAgentSidePanelPage';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { type CoreAgentSectionListItem } from '@/object-core/agents/types/CoreAgentSectionListItem';
import { type CoreAgentRecordAccessLevel } from '@/object-core/agents/types/CoreAgentRecordAccessLevel';
import { getCoreAgentRecordAccessLevels } from '@/object-core/agents/utils/getCoreAgentRecordAccessLevels';
import { getRoleWithCoreAgentRecordAccessLevel } from '@/object-core/agents/utils/getRoleWithCoreAgentRecordAccessLevel';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useObjectMetadataItemsThatCanHavePermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useObjectMetadataItemsThatCanHavePermission';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type CoreAgentDataAccessSectionProps = {
  agent: CoreAgent;
  isReadOnly: boolean;
};

export const CoreAgentDataAccessSection = ({
  agent,
  isReadOnly,
}: CoreAgentDataAccessSectionProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { openCoreAgentSidePanelPage } = useOpenCoreAgentSidePanelPage();
  const { role, updateRole, canEditRole } = useCoreAgentRole(agent);
  const { objectMetadataItemsThatCanHavePermission } =
    useObjectMetadataItemsThatCanHavePermission();

  const canRemoveAccess = !isReadOnly && canEditRole;

  const formatLevels = (levels: CoreAgentRecordAccessLevel[]) =>
    levels.length === 0
      ? t`Can't see`
      : CORE_AGENT_RECORD_ACCESS_LEVELS.filter(({ level }) =>
          levels.includes(level),
        )
          .map(({ label }) => t(label))
          .join(', ');

  const removeAccess = (objectMetadataId?: string) =>
    updateRole((currentRole) =>
      getRoleWithCoreAgentRecordAccessLevel({
        role: currentRole,
        level: 'see',
        isEnabled: false,
        objectMetadataId,
      }),
    );

  const allRecordsLevels = getCoreAgentRecordAccessLevels({ role });

  const allRecordsItem: CoreAgentSectionListItem = {
    id: 'all-records',
    label: t`All records`,
    description: formatLevels(allRecordsLevels),
    icon: <IconLock size={theme.icon.size.md} />,
    remove: canRemoveAccess
      ? {
          label: t`Remove access to all records`,
          onClick: () => removeAccess(),
        }
      : undefined,
  };

  const objectItems: CoreAgentSectionListItem[] =
    objectMetadataItemsThatCanHavePermission.flatMap((objectMetadataItem) => {
      const levels = getCoreAgentRecordAccessLevels({
        role,
        objectMetadataId: objectMetadataItem.id,
      });

      if (isDeeplyEqual(levels, allRecordsLevels)) {
        return [];
      }

      const objectLabel = objectMetadataItem.labelPlural;

      return [
        {
          id: objectMetadataItem.id,
          label: objectLabel,
          description: formatLevels(levels),
          icon: <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />,
          remove:
            canRemoveAccess && levels.length > 0
              ? {
                  label: t`Remove access to ${objectLabel}`,
                  onClick: () => removeAccess(objectMetadataItem.id),
                }
              : undefined,
        },
      ];
    });

  return (
    <Section.Root>
      <Section.Header
        title={t`Data access`}
        description={t`Records this agent can see and change`}
      />
      <CoreAgentSectionBody>
        <CoreAgentSectionList
          items={
            allRecordsLevels.length > 0
              ? [allRecordsItem, ...objectItems]
              : objectItems
          }
          emptyMessage={t`This agent can't see any records yet.`}
        />
        {!isReadOnly && (
          <Button
            variant="outline"
            startIcon={<IconEdit />}
            onClick={() =>
              openCoreAgentSidePanelPage({
                agentId: agent.id,
                page: SidePanelPages.AgentCoreDataAccess,
                pageTitle: t`Edit access`,
                pageIcon: IconLock,
              })
            }
          >{t`Edit access`}</Button>
        )}
      </CoreAgentSectionBody>
    </Section.Root>
  );
};
