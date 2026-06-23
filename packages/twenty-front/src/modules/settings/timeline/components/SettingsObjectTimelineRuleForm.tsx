import { useMemo } from 'react';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useTimelineProjectionRuleForm } from '@/settings/timeline/hooks/useTimelineProjectionRuleForm';
import { useTimelineProjectionRules } from '@/settings/timeline/hooks/useTimelineProjectionRules';
import { type TimelineProjectionRule } from '@/settings/timeline/types/TimelineProjectionRule';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Card } from 'twenty-ui/surfaces';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const PROJECTABLE_SOURCE_OBJECT_NAME_SINGULARS = [
  'company',
  'opportunity',
  'person',
];

export const SettingsObjectTimelineRuleForm = ({
  objectMetadataItem,
  rule,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  rule?: TimelineProjectionRule;
}) => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { createRule, updateRule } = useTimelineProjectionRules();

  const { activeNonSystemObjectMetadataItems, objectMetadataItems } =
    useFilteredObjectMetadataItems();

  const activityTypeObjectMetadataItems = useMemo(
    () =>
      objectMetadataItems.filter((item) =>
        ['note', 'task'].includes(item.nameSingular),
      ),
    [objectMetadataItems],
  );

  const {
    sourceObjectMetadataId,
    setSourceObjectMetadataId,
    linkedObjectMetadataIds,
    toggleActivityType,
    isSubmitting,
    setIsSubmitting,
    canSave,
  } = useTimelineProjectionRuleForm({
    initialSourceObjectMetadataId: rule?.sourceObjectMetadataId,
    initialLinkedObjectMetadataIds:
      rule?.linkedObjectMetadataIds ??
      activityTypeObjectMetadataItems.map((item) => item.id),
  });

  // Only objects with a dedicated target column on timelineActivity can be
  // inherited from; custom objects share a single morph column, so are excluded.
  const sourceOptions = activeNonSystemObjectMetadataItems
    .filter(
      (item) =>
        item.id !== objectMetadataItem.id &&
        PROJECTABLE_SOURCE_OBJECT_NAME_SINGULARS.includes(item.nameSingular),
    )
    .map((item) => ({ label: item.labelSingular, value: item.id }));

  const objectDetailParams = {
    objectNamePlural: objectMetadataItem.namePlural,
  };

  const handleSave = async () => {
    if (!isDefined(sourceObjectMetadataId)) {
      return;
    }

    setIsSubmitting(true);

    const input = {
      anchorObjectMetadataId: objectMetadataItem.id,
      sourceObjectMetadataId,
      linkedObjectMetadataIds,
    };

    try {
      if (isDefined(rule)) {
        await updateRule(rule.id, input);
      } else {
        await createRule(input);
      }

      navigate(SettingsPath.ObjectDetail, objectDetailParams);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <SettingsPageLayout
      title={isDefined(rule) ? t`Edit rule` : t`New rule`}
      links={[
        { children: t`Workspace` },
        {
          children: t`Data model`,
          href: getSettingsPath(SettingsPath.Objects),
        },
        {
          children: objectMetadataItem.labelPlural,
          href: getSettingsPath(SettingsPath.ObjectDetail, {
            objectNamePlural: objectMetadataItem.namePlural,
          }),
        },
        { children: isDefined(rule) ? t`Edit rule` : t`New rule` },
      ]}
      actionButton={
        <SaveAndCancelButtons
          onSave={handleSave}
          onCancel={() =>
            navigate(SettingsPath.ObjectDetail, objectDetailParams)
          }
          isSaveDisabled={!canSave}
          isLoading={isSubmitting}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Inherits from`}
            description={t`Activities targeting these related records will show on this object's timeline.`}
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
