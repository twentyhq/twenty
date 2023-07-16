import { useParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import { IconLink, IconUser } from '@tabler/icons-react';

import { Timeline } from '@/activities/timeline/components/Timeline';
import { usePersonQuery } from '@/people/queries';
import { PropertyBox } from '@/ui/editable-field/property-box/components/PropertyBox';
import { PropertyBoxItem } from '@/ui/editable-field/property-box/components/PropertyBoxItem';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/components/ShowPageLeftContainer';
import { ShowPageRightContainer } from '@/ui/layout/show-page/components/ShowPageRightContainer';
import { ShowPageSummaryCard } from '@/ui/layout/show-page/components/ShowPageSummaryCard';
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
            id={person?.id}
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
