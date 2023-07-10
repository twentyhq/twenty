import { useParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';

import { Timeline } from '@/comments/components/Timeline';
import { usePersonQuery } from '@/people/services';
import { PropertyBox } from '@/ui/components/property-box/PropertyBox';
import { PropertyBoxItem } from '@/ui/components/property-box/PropertyBoxItem';
import { IconLink, IconUser } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/containers/ShowPageLeftContainer';
import { ShowPageRightContainer } from '@/ui/layout/show-page/containers/ShowPageRightContainer';
import { ShowPageSummaryCard } from '@/ui/layout/show-page/ShowPageSummaryCard';
import { CommentableType } from '~/generated/graphql';

export function PersonShow() {
  const personId = useParams().personId ?? '';

  const { data } = usePersonQuery(personId);
  const person = data?.findUniquePerson;

  const theme = useTheme();

  return (
    <WithTopBarContainer
      title={person?.firstName ?? ''}
      icon={<IconUser size={theme.icon.size.md} />}
    >
      <>
        <ShowPageLeftContainer>
          <ShowPageSummaryCard
            title={person?.displayName ?? 'No name'}
            date={person?.createdAt ?? ''}
          />
          <PropertyBox extraPadding={true}>
            <>
              <PropertyBoxItem
                icon={<IconLink />}
                value={person?.firstName ?? 'No First name'}
              />
            </>
          </PropertyBox>
        </ShowPageLeftContainer>
        <ShowPageRightContainer>
          <Timeline
            entity={{ id: person?.id ?? '', type: CommentableType.Person }}
          />
        </ShowPageRightContainer>
      </>
    </WithTopBarContainer>
  );
}
