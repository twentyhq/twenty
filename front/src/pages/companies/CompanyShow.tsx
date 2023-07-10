import { useParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';

import { Timeline } from '@/comments/components/timeline/Timeline';
import { useCompanyQuery } from '@/companies/services';
import { useHotkeysScopeOnMountOnly } from '@/hotkeys/hooks/useHotkeysScopeOnMountOnly';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { RawLink } from '@/ui/components/links/RawLink';
import { PropertyBox } from '@/ui/components/property-box/PropertyBox';
import { PropertyBoxItem } from '@/ui/components/property-box/PropertyBoxItem';
import { IconBuildingSkyscraper, IconLink, IconMap } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/containers/ShowPageLeftContainer';
import { ShowPageRightContainer } from '@/ui/layout/show-page/containers/ShowPageRightContainer';
import { ShowPageSummaryCard } from '@/ui/layout/show-page/ShowPageSummaryCard';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import { CommentableType } from '~/generated/graphql';

export function CompanyShow() {
  const companyId = useParams().companyId ?? '';

  useHotkeysScopeOnMountOnly({
    scope: InternalHotkeysScope.ShowPage,
    customScopes: { 'command-menu': true, goto: true },
  });

  const { data } = useCompanyQuery(companyId);
  const company = data?.findUniqueCompany;

  const theme = useTheme();

  return (
    <WithTopBarContainer
      title={company?.name ?? ''}
      icon={<IconBuildingSkyscraper size={theme.icon.size.md} />}
    >
      <>
        <ShowPageLeftContainer>
          <ShowPageSummaryCard
            logoOrAvatar={getLogoUrlFromDomainName(company?.domainName ?? '')}
            title={company?.name ?? 'No name'}
            date={company?.createdAt ?? ''}
          />
          <PropertyBox extraPadding={true}>
            <>
              <PropertyBoxItem
                icon={<IconLink />}
                value={
                  <RawLink
                    href={
                      company?.domainName
                        ? 'https://' + company?.domainName
                        : ''
                    }
                  >
                    {company?.domainName}
                  </RawLink>
                }
              />
              <PropertyBoxItem
                icon={<IconMap />}
                value={company?.address ? company?.address : 'No address'}
              />
            </>
          </PropertyBox>
        </ShowPageLeftContainer>
        <ShowPageRightContainer>
          <Timeline
            entity={{ id: company?.id ?? '', type: CommentableType.Company }}
          />
        </ShowPageRightContainer>
      </>
    </WithTopBarContainer>
  );
}
