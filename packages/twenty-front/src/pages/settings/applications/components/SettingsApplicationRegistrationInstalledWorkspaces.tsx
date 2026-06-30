import styled from '@emotion/styled';
import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import { IconChevronDown, IconDotsVertical } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { Card, OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import {
  type ApplicationRegistration,
  FindApplicationRegistrationInstalledWorkspacesDocument,
} from '~/generated-metadata/graphql';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const INITIAL_VISIBLE_WORKSPACES = 3;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${themeCssVariables.spacing[2]};
`;

export const SettingsApplicationRegistrationInstalledWorkspaces = ({
  registration,
}: {
  registration: ApplicationRegistration;
}) => {
  const { t } = useLingui();

  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const applicationRegistrationId = registration.id;

  const { data, fetchMore } = useQuery(
    FindApplicationRegistrationInstalledWorkspacesDocument,
    {
      variables: { id: applicationRegistrationId, page: 1 },
      skip: !applicationRegistrationId,
    },
  );

  const result = data?.findApplicationRegistrationInstalledWorkspaces;
  const workspaces = result?.workspaces ?? [];
  const totalCount = result?.totalCount ?? 0;
  const hasMore = result?.hasMore ?? false;

  if (totalCount === 0) {
    return null;
  }

  const visibleWorkspaces = isExpanded
    ? workspaces
    : workspaces.slice(0, INITIAL_VISIBLE_WORKSPACES);

  const handleShowMore = () => {
    const nextPage = currentPage + 1;

    fetchMore({
      variables: { id: applicationRegistrationId, page: nextPage },
      updateQuery: (previousData, { fetchMoreResult }) => {
        if (!isDefined(fetchMoreResult)) {
          return previousData;
        }

        return {
          findApplicationRegistrationInstalledWorkspaces: {
            ...fetchMoreResult.findApplicationRegistrationInstalledWorkspaces,
            workspaces: [
              ...previousData.findApplicationRegistrationInstalledWorkspaces
                .workspaces,
              ...fetchMoreResult.findApplicationRegistrationInstalledWorkspaces
                .workspaces,
            ],
          },
        };
      },
    });

    setCurrentPage(nextPage);
  };

  return (
    <Section>
      <H2Title
        title={t`Installed workspaces`}
        description={t`Workspaces that have installed this app`}
      />
      <Card rounded backgroundColor={themeCssVariables.background.secondary}>
        <Table>
          {visibleWorkspaces.map((workspace) => (
            <TableRow key={workspace.id} gridAutoColumns="1fr 120px">
              <TableCell
                color={themeCssVariables.font.color.primary}
                gap={themeCssVariables.spacing[2]}
                overflow="hidden"
              >
                <Avatar
                  avatarUrl={getAbsoluteImageUrl(workspace.logo ?? undefined)}
                  placeholder={workspace.displayName ?? '—'}
                  placeholderColorSeed={workspace.id}
                  size="md"
                />
                <OverflowingTextWithTooltip
                  text={workspace.displayName ?? '—'}
                />
              </TableCell>
              <TableCell
                align="right"
                color={themeCssVariables.font.color.tertiary}
              >
                {workspace.version ?? '—'}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
      {!isExpanded && totalCount > INITIAL_VISIBLE_WORKSPACES && (
        <StyledButtonContainer>
          <Button
            title={t`Show all`}
            Icon={IconChevronDown}
            variant="secondary"
            size="small"
            onClick={() => setIsExpanded(true)}
          />
        </StyledButtonContainer>
      )}
      {isExpanded && hasMore && (
        <StyledButtonContainer>
          <Button
            title={t`Show more`}
            Icon={IconDotsVertical}
            variant="secondary"
            size="small"
            onClick={handleShowMore}
          />
        </StyledButtonContainer>
      )}
    </Section>
  );
};
