import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';
import { Section } from 'twenty-ui/components/layout';
import { Button } from 'twenty-ui/primitives/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { SettingsApplicationContentTypeIcon } from '@/settings/applications/components/SettingsApplicationContentTypeIcon';
import { SettingsApplicationTableRowChevronIcon } from '@/settings/applications/components/SettingsApplicationTableRowChevronIcon';
import { APPLICATION_CONTENT_TYPE_CONFIGS } from '@/settings/applications/constants/ApplicationContentTypeConfigs';
import { useApplicationContentItemDisplay } from '@/settings/applications/hooks/useApplicationContentItemDisplay';
import { useApplicationContentObjectResolver } from '@/settings/applications/hooks/useApplicationContentObjectResolver';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';
import { getApplicationContentIncludesText } from '@/settings/applications/utils/getApplicationContentIncludesText';
import { getNonEmptyApplicationContentTypes } from '@/settings/applications/utils/getNonEmptyApplicationContentTypes';
import { StyledNameTableCell } from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

const SUMMARY_CONTENT_TYPE_LIMIT = 6;

const SUMMARY_TABLE_GRID_TEMPLATE_COLUMNS =
  'minmax(0, 168px) minmax(0, 1fr) 64px 36px';

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[2]};
`;

type SettingsApplicationContentSummarySectionProps = {
  applicationName: string;
  content: ApplicationContent;
  contentPath: string;
  getContentTypePath: (contentType: ApplicationContentType) => string;
};

export const SettingsApplicationContentSummarySection = ({
  applicationName,
  content,
  contentPath,
  getContentTypePath,
}: SettingsApplicationContentSummarySectionProps) => {
  const { t } = useLingui();
  const resolveObject = useApplicationContentObjectResolver(content);
  const { getItemLabel } = useApplicationContentItemDisplay(content);

  const contentTypes = getNonEmptyApplicationContentTypes(content);

  if (contentTypes.length === 0) {
    return null;
  }

  return (
    <Section.Root>
      <Section.Header
        title={t`Content`}
        description={t`What ${applicationName} adds to your workspace`}
      />
      <Table>
        <TableRow gridTemplateColumns={SUMMARY_TABLE_GRID_TEMPLATE_COLUMNS}>
          <TableHeader>{t`Name`}</TableHeader>
          <TableHeader>{t`Includes`}</TableHeader>
          <TableHeader align="right">{t`Count`}</TableHeader>
          <TableHeader />
        </TableRow>
        {contentTypes
          .slice(0, SUMMARY_CONTENT_TYPE_LIMIT)
          .map((contentType) => (
            <TableRow
              key={contentType}
              gridTemplateColumns={SUMMARY_TABLE_GRID_TEMPLATE_COLUMNS}
              to={getContentTypePath(contentType)}
            >
              <StyledNameTableCell minWidth="0" overflow="hidden">
                <SettingsApplicationContentTypeIcon contentType={contentType} />
                <OverflowingTextWithTooltip
                  text={t(APPLICATION_CONTENT_TYPE_CONFIGS[contentType].label)}
                />
              </StyledNameTableCell>
              <TableCell
                color={themeCssVariables.font.color.secondary}
                minWidth="0"
                overflow="hidden"
              >
                <OverflowingTextWithTooltip
                  text={getApplicationContentIncludesText({
                    contentType,
                    items: content[contentType],
                    getItemLabel: (item) => getItemLabel(contentType, item),
                    getObjectLabel: (objectUniversalIdentifier) =>
                      resolveObject(objectUniversalIdentifier)?.label,
                    formatFieldCountOnObject: (count, objectLabel) =>
                      t`${count} on ${objectLabel}`,
                  })}
                />
              </TableCell>
              <TableCell
                align="right"
                color={themeCssVariables.font.color.secondary}
              >
                {content[contentType].length}
              </TableCell>
              <TableCell
                align="right"
                padding={`0 ${themeCssVariables.spacing[2]} 0 0`}
              >
                <SettingsApplicationTableRowChevronIcon />
              </TableCell>
            </TableRow>
          ))}
      </Table>
      <StyledFooter>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          role="link"
          render={<Link to={contentPath} />}
        >
          {t`See more`}
        </Button>
      </StyledFooter>
    </Section.Root>
  );
};
