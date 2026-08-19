import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useFindManyTimelineActivityRules } from '@/settings/data-model/timeline-rules/hooks/useFindManyTimelineActivityRules';
import { useUpsertTimelineActivityRule } from '@/settings/data-model/timeline-rules/hooks/useUpsertTimelineActivityRule';
import {
  getSettingsTimelineRuleCandidateRelations,
  type SettingsTimelineRuleCandidateRelation,
} from '@/settings/data-model/timeline-rules/utils/getSettingsTimelineRuleCandidateRelations';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useLingui } from '@lingui/react/macro';
import { useContext, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const NEW_TIMELINE_RULE_TABLE_GRID_TEMPLATE_COLUMNS =
  'minmax(0, 1fr) minmax(0, 1fr) 120px';

export const SettingsObjectNewTimelineRule = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const navigateApp = useNavigateApp();
  const { objectNamePlural = '' } = useParams();
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();
  const { objectMetadataItems } = useObjectMetadataItems();
  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);

  const { timelineActivityRules } = useFindManyTimelineActivityRules();
  const { upsertTimelineActivityRule, loading: isCreating } =
    useUpsertTimelineActivityRule();

  useEffect(() => {
    if (!isDefined(objectMetadataItem)) {
      navigateApp(AppPath.NotFound);
    }
  }, [objectMetadataItem, navigateApp]);

  const candidateRelations = useMemo(
    () =>
      isDefined(objectMetadataItem)
        ? getSettingsTimelineRuleCandidateRelations({
            timelineActivityRules,
            objectMetadataItem,
            objectMetadataItems,
          })
        : [],
    [timelineActivityRules, objectMetadataItem, objectMetadataItems],
  );

  if (!isDefined(objectMetadataItem)) {
    return null;
  }

  const objectLabelSingular = objectMetadataItem.labelSingular;

  const handleCreate = async (
    candidate: SettingsTimelineRuleCandidateRelation,
  ) => {
    const result = await upsertTimelineActivityRule({
      objectMetadataId: candidate.sourceObjectMetadataItem.id,
      relationFieldMetadataId: candidate.relationFieldMetadataItem.id,
    });

    if (result.status === 'successful') {
      navigate(SettingsPath.ObjectTimelineRuleEdit, {
        objectNamePlural,
        relationFieldMetadataId: candidate.relationFieldMetadataItem.id,
      });
    }
  };

  return (
    <SettingsPageLayout
      title={t`New rule`}
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
        { children: t`New rule` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Select a relation`}
            description={t`Events on the related record will write to the ${objectLabelSingular} timeline. A rule on a junction relation is shared by every object the junction reaches.`}
          />
          <Table>
            <TableRow
              gridTemplateColumns={
                NEW_TIMELINE_RULE_TABLE_GRID_TEMPLATE_COLUMNS
              }
            >
              <TableHeader>{t`Object`}</TableHeader>
              <TableHeader>{t`Relation`}</TableHeader>
              <TableHeader></TableHeader>
            </TableRow>
            <TableBody>
              {candidateRelations.map((candidate) => {
                const Icon = getIcon(candidate.sourceObjectMetadataItem.icon);

                return (
                  <TableRow
                    key={candidate.relationFieldMetadataItem.id}
                    gridTemplateColumns={
                      NEW_TIMELINE_RULE_TABLE_GRID_TEMPLATE_COLUMNS
                    }
                  >
                    <TableCell
                      color={themeCssVariables.font.color.primary}
                      gap={themeCssVariables.spacing[2]}
                    >
                      <Icon
                        style={{ minWidth: theme.icon.size.md }}
                        size={theme.icon.size.md}
                        stroke={theme.icon.stroke.sm}
                      />
                      {candidate.sourceObjectMetadataItem.labelPlural}
                    </TableCell>
                    <TableCell>
                      {candidate.relationFieldMetadataItem.label}
                    </TableCell>
                    <TableCell>
                      <Button
                        title={t`Create rule`}
                        size="small"
                        variant="secondary"
                        disabled={isCreating}
                        onClick={() => handleCreate(candidate)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Section>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
