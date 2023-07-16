import { useParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';

import { Timeline } from '@/activities/timeline/components/Timeline';
import { CompanyAccountOwnerEditableField } from '@/companies/editable-field/components/CompanyAccountOwnerEditableField';
import { CompanyAddressEditableField } from '@/companies/editable-field/components/CompanyAddressEditableField';
import { CompanyCreatedAtEditableField } from '@/companies/editable-field/components/CompanyCreatedAtEditableField';
import { CompanyDomainNameEditableField } from '@/companies/editable-field/components/CompanyDomainNameEditableField';
import { CompanyEmployeesEditableField } from '@/companies/editable-field/components/CompanyEmployeesEditableField';
import { useCompanyQuery } from '@/companies/queries';
import { PropertyBox } from '@/ui/editable-field/property-box/components/PropertyBox';
import { IconBuildingSkyscraper } from '@/ui/icon';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/components/ShowPageLeftContainer';
import { ShowPageRightContainer } from '@/ui/layout/show-page/components/ShowPageRightContainer';
import { ShowPageSummaryCard } from '@/ui/layout/show-page/components/ShowPageSummaryCard';
import { CommentableType } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

export function CompanyShow() {
  const companyId = useParams().companyId ?? '';

  const { data } = useCompanyQuery(companyId);
  const company = data?.findUniqueCompany;

  const theme = useTheme();

  if (!company) return <></>;

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
