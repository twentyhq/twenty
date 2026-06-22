import { useMemo } from 'react';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useTimelineProjectionRules } from '@/settings/timeline/hooks/useTimelineProjectionRules';
import { useLingui } from '@lingui/react/macro';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SettingsPath } from 'twenty-shared/types';
import { LightIconButton } from 'twenty-ui/input';
import { IconTrash } from 'twenty-ui/icon';

type SettingsTimelineRuleItem = {
  id: string;
  anchorLabel: string;
  sourceLabel: string;
  activitiesLabel: string;
};

export const SettingsTimeline = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();

  const { rules, deleteRule } = useTimelineProjectionRules();
  const { objectMetadataItems } = useFilteredObjectMetadataItems();

  const labelByObjectMetadataId = useMemo(
    () =>
      Object.fromEntries(
        objectMetadataItems.map((objectMetadataItem) => [
          objectMetadataItem.id,
          objectMetadataItem.labelSingular,
        ]),
      ),
    [objectMetadataItems],
  );

  const items: SettingsTimelineRuleItem[] = rules.map((rule) => ({
    id: rule.id,
    anchorLabel:
      labelByObjectMetadataId[rule.anchorObjectMetadataId] ?? t`Unknown`,
    sourceLabel:
      labelByObjectMetadataId[rule.sourceObjectMetadataId] ?? t`Unknown`,
    activitiesLabel: rule.linkedObjectMetadataIds
      .map((id) => labelByObjectMetadataId[id] ?? t`Unknown`)
      .join(', '),
  }));

  return (
    <SettingsPageLayout
      title={t`Timeline`}
      links={[{ children: t`Workspace` }, { children: t`Timeline` }]}
    >
      <SettingsPageContainer>
        <SettingsTableListSection<SettingsTimelineRuleItem>
          title={t`Projection rules`}
          description={t`Records inherit notes & tasks from their related people by default. Add rules to inherit activities from other related records.`}
          items={items}
          columns={[
            {
              label: t`Timeline of`,
              Cell: ({ item }) => <>{item.anchorLabel}</>,
            },
            {
              label: t`Inherits from`,
              Cell: ({ item }) => <>{item.sourceLabel}</>,
            },
            {
              label: t`Activities`,
              Cell: ({ item }) => <>{item.activitiesLabel}</>,
            },
            {
              label: '',
              align: 'right',
              Cell: ({ item }) => (
                <LightIconButton
                  Icon={IconTrash}
                  accent="tertiary"
                  onClick={() => deleteRule(item.id)}
                />
              ),
            },
          ]}
          gridAutoColumns="3fr 3fr 3fr 1fr"
          footerButtonLabel={t`Add rule`}
          onFooterButtonClick={() =>
            navigate(SettingsPath.NewTimelineProjectionRule)
          }
        />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
