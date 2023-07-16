import { useParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';

import { Timeline } from '@/comments/components/timeline/Timeline';
import { CompanyAccountOwnerEditableField } from '@/companies/fields/components/CompanyAccountOwnerEditableField';
import { CompanyAddressEditableField } from '@/companies/fields/components/CompanyAddressEditableField';
import { CompanyCreatedAtEditableField } from '@/companies/fields/components/CompanyCreatedAtEditableField';
import { CompanyDomainNameEditableField } from '@/companies/fields/components/CompanyDomainNameEditableField';
import { CompanyEmployeesEditableField } from '@/companies/fields/components/CompanyEmployeesEditableField';
import { useCompanyQuery } from '@/companies/services';
import { PropertyBox } from '@/ui/components/property-box/PropertyBox';
import { IconBuildingSkyscraper } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/containers/ShowPageLeftContainer';
import { ShowPageRightContainer } from '@/ui/layout/show-page/containers/ShowPageRightContainer';
import { ShowPageSummaryCard } from '@/ui/layout/show-page/ShowPageSummaryCard';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import { CommentableType } from '~/generated/graphql';

export function CompanyShow() {
  const companyId = useParams().companyId ?? '';

  const { data } = useCompanyQuery(companyId);
  const company = data?.findUniqueCompany;

  const theme = useTheme();

  if (!company) return <div>Company not found</div>;

  return (
    <WithTopBarContainer
      title={company?.name ?? ''}
      icon={<IconBuildingSkyscraper size={theme.icon.size.md} />}
    >
      <ShowPageLeftContainer>
        <ShowPageSummaryCard
          id={company?.id}
          logoOrAvatar={getLogoUrlFromDomainName(company?.domainName ?? '')}
          title={company?.name ?? 'No name'}
          date={company?.createdAt ?? ''}
        />
        <PropertyBox extraPadding={true}>
          <CompanyDomainNameEditableField company={company} />
          <CompanyAccountOwnerEditableField company={company} />
          <CompanyEmployeesEditableField company={company} />
          <CompanyAddressEditableField company={company} />
          <CompanyCreatedAtEditableField company={company} />
        </PropertyBox>
      </ShowPageLeftContainer>
      <ShowPageRightContainer>
        <Timeline
          entity={{ id: company?.id ?? '', type: CommentableType.Company }}
        />
      </ShowPageRightContainer>
    </WithTopBarContainer>
  );
}
