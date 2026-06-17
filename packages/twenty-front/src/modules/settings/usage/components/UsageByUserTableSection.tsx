import { UsageSectionSkeleton } from '@/settings/usage/components/UsageSectionSkeleton';
import { useUsageAnalyticsData } from '@/settings/usage/hooks/useUsageAnalyticsData';
import { useUsageValueFormatter } from '@/settings/usage/hooks/useUsageValueFormatter';
import { Select } from '@/ui/input/components/Select';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext, useState } from 'react';
import { Avatar, H2Title, IconChevronRight } from 'twenty-ui/display';
import { SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { type UsageOperationType } from '~/generated-metadata/graphql';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledIconChevronRightContainer = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

const GRID_TEMPLATE_COLUMNS = '1fr 120px 36px';

type UsageByUserTableSectionProps = {
  title: string;
  description: string;
  operationTypes?: UsageOperationType[];
  skip?: boolean;
  getDetailPath: (userWorkspaceId: string) => string;
  showAvatar?: boolean;
};

export const UsageByUserTableSection = ({
  title,
  description,
  operationTypes,
  skip,
  getDetailPath,
  showAvatar = false,
}: UsageByUserTableSectionProps) => {
  const { theme } = useContext(ThemeContext);
  const { formatUsageValue } = useUsageValueFormatter();
  const [searchTerm, setSearchTerm] = useState('');

  const { analytics, isInitialLoading, period, setPeriod, periodOptions } =
    useUsageAnalyticsData({
      operationTypes,
      skip,
    });

  if (isInitialLoading) {
    return <UsageSectionSkeleton />;
  }

  if (!analytics) {
    return null;
  }

  const usageByUser = analytics.usageByUser;

  if (usageByUser.length === 0) {
    return null;
  }

  const filteredUsers = usageByUser.filter((item) => {
    const search = normalizeSearchText(searchTerm);
    const name = normalizeSearchText(item.label ?? item.key);

    return name.includes(search);
  });

  return (
    <Section>
      <H2Title
        title={title}
        description={description}
        adornment={
          <Select
            dropdownId={`${title.replace(/\s+/g, '-').toLowerCase()}-period`}
            value={period}
            options={periodOptions}
            onChange={setPeriod}
            needIconCheck
            selectSizeVariant="small"
          />
        }
      />
      <StyledSearchInputContainer>
        <SearchInput
          placeholder={t`Search for a user...`}
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </StyledSearchInputContainer>
      <Table>
        <TableRow gridTemplateColumns={GRID_TEMPLATE_COLUMNS}>
          <TableHeader>{t`Name`}</TableHeader>
          <TableHeader align="right">{t`Usage`}</TableHeader>
          <TableHeader />
        </TableRow>
        {filteredUsers.map((item) => (
          <TableRow
            key={item.key}
            gridTemplateColumns={GRID_TEMPLATE_COLUMNS}
            to={getDetailPath(item.key)}
          >
            <TableCell
              color={themeCssVariables.font.color.primary}
              gap={showAvatar ? themeCssVariables.spacing[2] : undefined}
            >
              {showAvatar && (
                <Avatar
                  type="rounded"
                  size="md"
                  placeholder={item.label ?? item.key}
                  placeholderColorSeed={item.key}
                />
              )}
              {item.label ?? item.key}
            </TableCell>
            <TableCell align="right">
              {formatUsageValue(item.creditsUsed)}
            </TableCell>
            <TableCell align="center">
              <StyledIconChevronRightContainer>
                <IconChevronRight
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.sm}
                />
              </StyledIconChevronRightContainer>
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </Section>
  );
};
