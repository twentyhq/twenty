import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useRelationTimelineActivityType } from '@/settings/data-model/fields/forms/timeline-activity/hooks/useRelationTimelineActivityType';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconTimelineEvent } from 'twenty-ui/icon';
import { Section } from 'twenty-ui/layout';
import { Card } from 'twenty-ui/surfaces';
import { H2Title } from 'twenty-ui/typography';

type SettingsDataModelFieldTimelineActivitySectionProps = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: EnrichedObjectMetadataItem;
  disabled?: boolean;
};

export const SettingsDataModelFieldTimelineActivitySection = ({
  fieldMetadataItem,
  objectMetadataItem,
  disabled,
}: SettingsDataModelFieldTimelineActivitySectionProps) => {
  const { t } = useLingui();

  const {
    canCreateTimelineActivityType,
    canToggleTimelineLogging,
    isMutating,
    isTimelineLoggingEnabled,
    relationTimelineActivityType,
    setTimelineLoggingEnabled,
  } = useRelationTimelineActivityType({
    fieldMetadataItem,
    objectMetadataItem,
  });

  const hasTimelineActivityType = isDefined(relationTimelineActivityType);

  if (!hasTimelineActivityType && !canCreateTimelineActivityType) {
    return null;
  }

  const toggleDescription = hasTimelineActivityType
    ? t`Related record timelines show "${relationTimelineActivityType.label}"`
    : t`Show an entry on the related record's timeline when a record is linked through this relation`;

  return (
    <AdvancedSettingsWrapper>
      <Section>
        <H2Title
          title={t`Timeline`}
          description={t`Log records linked through this relation`}
        />
        <Card rounded>
          <SettingsOptionCardContentToggle
            Icon={IconTimelineEvent}
            title={t`Log to timeline`}
            description={toggleDescription}
            checked={isTimelineLoggingEnabled}
            disabled={disabled || isMutating || !canToggleTimelineLogging}
            advancedMode
            onChange={setTimelineLoggingEnabled}
          />
        </Card>
      </Section>
    </AdvancedSettingsWrapper>
  );
};
