import { useMemo } from 'react';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useTimelineProjectionRuleForm } from '@/settings/timeline/hooks/useTimelineProjectionRuleForm';
import { useTimelineProjectionRules } from '@/settings/timeline/hooks/useTimelineProjectionRules';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Card } from 'twenty-ui/surfaces';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const PROJECTABLE_SOURCE_OBJECT_NAME_SINGULARS = [
  'company',
  'opportunity',
  'person',
];

export const SettingsTimelineNewRule = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { createRule } = useTimelineProjectionRules();

  const { activeNonSystemObjectMetadataItems, objectMetadataItems } =
    useFilteredObjectMetadataItems();

  const activityTypeObjectMetadataItems = useMemo(
    () =>
      objectMetadataItems.filter((objectMetadataItem) =>
        ['note', 'task'].includes(objectMetadataItem.nameSingular),
      ),
    [objectMetadataItems],
  );

  const {
    anchorObjectMetadataId,
    setAnchorObjectMetadataId,
    sourceObjectMetadataId,
    setSourceObjectMetadataId,
    linkedObjectMetadataIds,
    toggleActivityType,
    isSubmitting,
    setIsSubmitting,
    canSave,
  } = useTimelineProjectionRuleForm(
    activityTypeObjectMetadataItems.map((item) => item.id),
  );

  const anchorOptions = activeNonSystemObjectMetadataItems.map((item) => ({
    label: item.labelSingular,
    value: item.id,
  }));

  // Only objects with a dedicated target column on timelineActivity can be
  // inherited from; otherwise the resulting timeline filter would reference a
  // missing field. Custom objects share a single morph column, so are excluded.
  const sourceOptions = activeNonSystemObjectMetadataItems
    .filter((item) =>
      PROJECTABLE_SOURCE_OBJECT_NAME_SINGULARS.includes(item.nameSingular),
    )
    .map((item) => ({ label: item.labelSingular, value: item.id }));

  const handleSave = async () => {
    if (
      !isDefined(anchorObjectMetadataId) ||
      !isDefined(sourceObjectMetadataId)
    ) {
      return;
    }

    setIsSubmitting(true);

    await createRule({
      anchorObjectMetadataId,
      sourceObjectMetadataId,
      linkedObjectMetadataIds,
    });

    navigate(SettingsPath.Timeline);
  };

  return (
    <SettingsPageLayout
      title={t`New rule`}
      links={[
        { children: t`Workspace` },
        { children: t`Timeline`, href: `/settings/${SettingsPath.Timeline}` },
        { children: t`New rule` },
      ]}
      actionButton={
        <SaveAndCancelButtons
          onSave={handleSave}
          onCancel={() => navigate(SettingsPath.Timeline)}
          isSaveDisabled={!canSave}
          isLoading={isSubmitting}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Timeline of`}
            description={t`The object whose timeline will show inherited activities.`}
          />
          <Select
            dropdownId="timeline-rule-anchor-object"
            fullWidth
            value={anchorObjectMetadataId ?? ''}
            options={anchorOptions}
            emptyOption={{ label: t`Select an object`, value: '' }}
            onChange={(value) =>
              setAnchorObjectMetadataId(value === '' ? undefined : value)
            }
            withSearchInput
          />
        </Section>
        <Section>
          <H2Title
            title={t`Inherits from`}
            description={t`Activities targeting these related records will be shown.`}
          />
          <Select
            dropdownId="timeline-rule-source-object"
            fullWidth
            value={sourceObjectMetadataId ?? ''}
            options={sourceOptions}
            emptyOption={{ label: t`Select an object`, value: '' }}
            onChange={(value) =>
              setSourceObjectMetadataId(value === '' ? undefined : value)
            }
            withSearchInput
          />
        </Section>
        <Section>
          <H2Title
            title={t`Activities`}
            description={t`The activity types to inherit.`}
          />
          <Card rounded>
            {activityTypeObjectMetadataItems.map(
              (activityTypeObjectMetadataItem) => (
                <SettingsOptionCardContentToggle
                  key={activityTypeObjectMetadataItem.id}
                  title={activityTypeObjectMetadataItem.labelPlural}
                  checked={linkedObjectMetadataIds.includes(
                    activityTypeObjectMetadataItem.id,
                  )}
                  onChange={(checked) =>
                    toggleActivityType(
                      activityTypeObjectMetadataItem.id,
                      checked,
                    )
                  }
                />
              ),
            )}
          </Card>
        </Section>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
