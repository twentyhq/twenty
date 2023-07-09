import { useParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';

import { Timeline } from '@/comments/components/Timeline';
import { usePersonQuery } from '@/people/services';
import { PropertyBox } from '@/ui/components/property-box/PropertyBox';
import { PropertyBoxItem } from '@/ui/components/property-box/PropertyBoxItem';
import { IconLink, IconUser } from '@/ui/icons/index';
import { ShowPageLayout } from '@/ui/layout/show-pages/ShowPageLayout';
import { ShowPageTopLeftContainer } from '@/ui/layout/show-pages/ShowPageTopLeftContainer';
import { CommentableType } from '~/generated/graphql';

export function PersonShow() {
  const personId = useParams().personId ?? '';

  const { data } = usePersonQuery(personId);
  const person = data?.findUniquePerson;

  const theme = useTheme();

  return (
    <ShowPageLayout
      title={person?.firstName ?? ''}
      icon={<IconUser size={theme.icon.size.md} />}
      leftSide={
        <>
          <ShowPageTopLeftContainer
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
        </>
      }
      rightSide={
        <Timeline
          entity={{ id: person?.id ?? '', type: CommentableType.Person }}
        />
      }
    />
  );
}
