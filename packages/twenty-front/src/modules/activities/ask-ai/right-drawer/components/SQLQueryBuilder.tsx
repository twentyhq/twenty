import { ComponentProps } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconChartCandle, IconSql } from 'twenty-ui';

import { SQL_QUERY_BUILDER_TAB_LIST_COMPONENT_ID } from '@/activities/ask-ai/right-drawer/constants/SqlQueryBuilder';
import { AutosizeTextInput } from '@/ui/input/components/AutosizeTextInput';
import { TabList } from '@/ui/layout/tab/components/TabList';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const StyledTabListContainer = styled.div`
  display: flex;
  margin-left: ${({ theme }) => theme.spacing(-2)};
`;

interface SQLQueryBuilderProps {
  loading?: boolean;
  sqlQuery?: string;
}

export const SQLQueryBuilder = (props: SQLQueryBuilderProps) => {
  const theme = useTheme();

  const SQL_QUERY_BUILDER_TABS: ComponentProps<typeof TabList>['tabs'] = [
    {
      id: 'raw-sql',
      title: 'Raw SQL',
      Icon: IconSql,
    },
    {
      id: 'query-builder',
      title: 'Query builder',
      Icon: IconChartCandle,
      disabled: true,
      pill: 'Coming soon',
    },
  ];

  return (
    <StyledContainer>
      <StyledTabListContainer>
        <TabList
          tabListId={SQL_QUERY_BUILDER_TAB_LIST_COMPONENT_ID}
          tabs={SQL_QUERY_BUILDER_TABS}
        />
      </StyledTabListContainer>
      {props.loading ? (
        <SkeletonTheme
          baseColor={theme.background.tertiary}
          highlightColor={theme.background.transparent.lighter}
          borderRadius={4}
        >
          <Skeleton width={84} height={24} />
        </SkeletonTheme>
      ) : (
        <AutosizeTextInput disabled placeholder="" value={props.sqlQuery} />
      )}
    </StyledContainer>
  );
};
