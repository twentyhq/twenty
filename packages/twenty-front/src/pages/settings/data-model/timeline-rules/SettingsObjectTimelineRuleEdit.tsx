import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useFindManyTimelineActivityRules } from '@/settings/data-model/timeline-rules/hooks/useFindManyTimelineActivityRules';
import { isTriggerableField } from '@/settings/data-model/timeline-rules/utils/isTriggerableField';
import { useResetTimelineActivityRule } from '@/settings/data-model/timeline-rules/hooks/useResetTimelineActivityRule';
import { useUpsertTimelineActivityRule } from '@/settings/data-model/timeline-rules/hooks/useUpsertTimelineActivityRule';
import { SettingsDataModelFieldSelectRows } from '@/settings/data-model/components/SettingsDataModelFieldSelectRows';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  IconLink,
  IconPencil,
  IconRestore,
  IconUnlink,
  useIcons,
} from 'twenty-ui/icon';
import { Button, type SelectOption } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { Card } from 'twenty-ui/surfaces';
import { H2Title } from 'twenty-ui/typography';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsObjectTimelineRuleEdit = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const navigateApp = useNavigateApp();
  const { objectNamePlural = '', relationFieldMetadataId = '' } = useParams();
  const { enqueueSuccessSnackBar } = useSnackBar();
  const { getIcon } = useIcons();

  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();
  const { objectMetadataItems } = useObjectMetadataItems();
  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);

  const { timelineActivityRules, loading } = useFindManyTimelineActivityRules();
  const { upsertTimelineActivityRule, loading: isSaving } =
    useUpsertTimelineActivityRule();
  const { resetTimelineActivityRule } = useResetTimelineActivityRule();

  const timelineActivityRule = timelineActivityRules.find(
    (rule) => rule.relationFieldMetadataId === relationFieldMetadataId,
  );

  const sourceObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === timelineActivityRule?.objectMetadataId,
  );

  const [enabledActions, setEnabledActions] = useState<Set<string>>(new Set());
  const [triggerFieldMetadataIds, setTriggerFieldMetadataIds] = useState<
    string[]
  >([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (hasInitialized || !isDefined(timelineActivityRule)) {
      return;
    }

    setEnabledActions(new Set(timelineActivityRule.actions));
    setTriggerFieldMetadataIds(
      timelineActivityRule.triggerFieldMetadataIds ?? [],
    );
    setHasInitialized(true);
  }, [hasInitialized, timelineActivityRule]);

  // A rule can be deleted or reset from another tab, which leaves the id in
  // this url pointing at nothing.
  useEffect(() => {
    if (loading) {
      return;
    }

    if (
      !isDefined(objectMetadataItem) ||
      !isDefined(timelineActivityRule) ||
      !isDefined(sourceObjectMetadataItem)
    ) {
      navigateApp(AppPath.NotFound);
    }
  }, [
    loading,
    objectMetadataItem,
    timelineActivityRule,
    sourceObjectMetadataItem,
    navigateApp,
  ]);

  const triggerableFields = useMemo(
    () =>
      (sourceObjectMetadataItem?.fields ?? [])
        .filter(isTriggerableField)
        .sort((left, right) => left.label.localeCompare(right.label)),
    [sourceObjectMetadataItem?.fields],
  );

  if (
    !isDefined(objectMetadataItem) ||
    !isDefined(timelineActivityRule) ||
    !isDefined(sourceObjectMetadataItem)
  ) {
    return null;
  }

  const sourceLabelSingular = sourceObjectMetadataItem.labelSingular;
  const objectLabelSingular = objectMetadataItem.labelSingular;

  const toggleAction = (action: string, enabled: boolean) => {
    setEnabledActions((previousActions) => {
      const nextActions = new Set(previousActions);

      if (enabled) {
        nextActions.add(action);
      } else {
        nextActions.delete(action);
      }

      return nextActions;
    });
  };

  const hasChanges =
    hasInitialized &&
    ([...enabledActions].sort().join(',') !==
      [...timelineActivityRule.actions].sort().join(',') ||
      [...triggerFieldMetadataIds].sort().join(',') !==
        [...(timelineActivityRule.triggerFieldMetadataIds ?? [])]
          .sort()
          .join(','));

  const canSave = hasChanges && enabledActions.size > 0 && !isSaving;

  const handleSave = async () => {
    const result = await upsertTimelineActivityRule({
      objectMetadataId: timelineActivityRule.objectMetadataId,
      relationFieldMetadataId: timelineActivityRule.relationFieldMetadataId,
      actions: [...enabledActions],
      triggerFieldMetadataIds:
        triggerFieldMetadataIds.length > 0 ? triggerFieldMetadataIds : null,
    });

    if (result.status === 'successful') {
      enqueueSuccessSnackBar({ message: t`Timeline rule saved` });
      navigate(SettingsPath.ObjectDetail, { objectNamePlural });
    }
  };

  const handleReset = async () => {
    const result = await resetTimelineActivityRule({
      objectMetadataId: timelineActivityRule.objectMetadataId,
      relationFieldMetadataId: timelineActivityRule.relationFieldMetadataId,
    });

    if (result.status === 'successful') {
      enqueueSuccessSnackBar({ message: t`Timeline rule reset` });
      navigate(SettingsPath.ObjectDetail, { objectNamePlural });
    }
  };

  const triggerFieldOptions: SelectOption<string>[] = triggerableFields.map(
    (field) => ({
      label: field.label,
      value: field.id,
      Icon: getIcon(field.icon),
    }),
  );

  return (
    <SettingsPageLayout
      title={t`${sourceObjectMetadataItem.labelPlural} rule`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        { children: t`Objects`, href: getSettingsPath(SettingsPath.Objects) },
        {
          children: objectMetadataItem.labelPlural,
          href: getSettingsPath(SettingsPath.ObjectDetail, {
            objectNamePlural,
          }),
        },
        { children: t`${sourceObjectMetadataItem.labelPlural} rule` },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isLoading={isSaving}
          isSaveDisabled={!canSave}
          onCancel={() =>
            navigate(SettingsPath.ObjectDetail, { objectNamePlural })
          }
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Events`}
            description={t`Which ${sourceLabelSingular} events write an entry to the timeline of linked records.`}
          />
          <Card rounded>
            <SettingsOptionCardContentToggle
              Icon={IconLink}
              title={t`${sourceLabelSingular} linked`}
              description={t`A ${sourceLabelSingular} is attached to a ${objectLabelSingular}.`}
              checked={enabledActions.has('linked')}
              onChange={(checked) => toggleAction('linked', checked)}
              divider
            />
            <SettingsOptionCardContentToggle
              Icon={IconUnlink}
              title={t`${sourceLabelSingular} unlinked`}
              description={t`A ${sourceLabelSingular} is detached from a ${objectLabelSingular}.`}
              checked={enabledActions.has('unlinked')}
              onChange={(checked) => toggleAction('unlinked', checked)}
              divider
            />
            <SettingsOptionCardContentToggle
              Icon={IconPencil}
              title={t`${sourceLabelSingular} updated`}
              description={t`A linked ${sourceLabelSingular} changes.`}
              checked={enabledActions.has('updated')}
              onChange={(checked) => toggleAction('updated', checked)}
            />
          </Card>
        </Section>
        {enabledActions.has('updated') && (
          <Section>
            <H2Title
              title={t`Fields that trigger it`}
              description={t`Only changes to these fields write an entry on linked timelines. With no field selected, any change does.`}
            />
            <SettingsDataModelFieldSelectRows
              values={triggerFieldMetadataIds}
              options={triggerFieldOptions}
              dropdownIdPrefix="timeline-rule-trigger-field"
              onChange={setTriggerFieldMetadataIds}
            />
          </Section>
        )}
        {timelineActivityRule.isOverridden && (
          <Section>
            <H2Title
              title={t`Reset`}
              description={t`Discard your changes and follow the data model default again.`}
            />
            <Button
              Icon={IconRestore}
              title={t`Reset to default`}
              size="small"
              onClick={handleReset}
            />
          </Section>
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
