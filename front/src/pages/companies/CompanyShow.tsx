import { useParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';

import { Timeline } from '@/comments/components/Timeline';
import { useCompanyQuery } from '@/companies/services';
import { PropertyBox } from '@/ui/components/property-box/PropertyBox';
import { PropertyBoxItem } from '@/ui/components/property-box/PropertyBoxItem';
import { IconBuildingSkyscraper, IconLink, IconMap } from '@/ui/icons/index';
import { ShowPageLayout } from '@/ui/layout/show-pages/ShowPageLayout';
import { ShowPageTopLeftContainer } from '@/ui/layout/show-pages/ShowPageTopLeftContainer';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import { CommentableType } from '~/generated/graphql';

export function CompanyShow() {
  const companyId = useParams().companyId ?? '';

  const { data } = useCompanyQuery(companyId);
  const company = data?.findUniqueCompany;

  const theme = useTheme();

  return (
    <ShowPageLayout
      title={company?.name ?? ''}
      icon={<IconBuildingSkyscraper size={theme.icon.size.md} />}
      leftSide={
        <>
          <ShowPageTopLeftContainer
            logoOrAvatar={getLogoUrlFromDomainName(company?.domainName ?? '')}
            title={company?.name ?? 'No name'}
            date={company?.createdAt ?? ''}
          />
          <PropertyBox extraPadding={true}>
            <>
              <PropertyBoxItem
                icon={<IconLink />}
                value={company?.domainName ?? 'No URL'}
                link={
                  company?.domainName ? 'https://' + company?.domainName : ''
                }
              />
              <PropertyBoxItem
                icon={<IconMap />}
                value={company?.address ? company?.address : 'No address'}
              />
            </>
          </PropertyBox>
        </>
      }
      rightSide={
        <Timeline
          entity={{ id: company?.id ?? '', type: CommentableType.Company }}
        />
      }
    />
  );
}
