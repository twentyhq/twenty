import { useParams } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { Timeline } from '@/comments/components/Timeline';
import { useCompanyQuery } from '@/companies/services';
import { PropertyBox } from '@/ui/components/property-box/PropertyBox';
import { PropertyBoxItem } from '@/ui/components/property-box/PropertyBoxItem';
import { IconBuildingSkyscraper, IconLink, IconMap } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';
import {
  beautifyExactDate,
  beautifyPastDateRelativeToNow,
} from '@/utils/datetime/date-utils';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import { CommentableType } from '~/generated/graphql';

const StyledCompanyContainer = styled.div`
  align-items: center;
  align-self: stretch;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 8px;
  display: flex;
  flex: 1 0 0;
`;

const StyledLeftPanelContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  background: ${({ theme }) => theme.background.secondary};
  border-radius: 8px;
  border-right: 1px solid ${({ theme }) => theme.border.color.light};
  padding: 0px ${({ theme }) => theme.spacing(3)};
  width: 320px;
`;

const StyledRightPanelContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
`;

const StyledPropertyBoxContainer = styled.div`
  padding: 0px 12px;
`;

export function CompanyShow() {
  const companyId = useParams().companyId ?? '';

  const { data } = useCompanyQuery(companyId);
  const company = data?.findUniqueCompany;

  const theme = useTheme();

  return (
    <WithTopBarContainer
      title={company?.name ?? ''}
      icon={<IconBuildingSkyscraper size={theme.icon.size.md} />}
    >
      <StyledCompanyContainer>
        <StyledLeftPanelContainer>
          <TopLeftHeaderOnShowPage
            logo={getLogoUrlFromDomainName(company?.domainName ?? '')}
            title={company?.name ?? ''}
            date={company?.createdAt ?? ''}
          />
          <StyledPropertyBoxContainer>
            <PropertyBox>
              <>
                <PropertyBoxItem
                  icon={<IconLink />}
                  value={company?.domainName ?? ''}
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
          </StyledPropertyBoxContainer>
        </StyledLeftPanelContainer>
        <StyledRightPanelContainer>
          <Timeline
            entity={{ id: company?.id ?? '', type: CommentableType.Company }}
          />
        </StyledRightPanelContainer>
      </StyledCompanyContainer>
    </WithTopBarContainer>
  );
}

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

const StyledShowTopLeftImageContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(6)} ${({ theme }) => theme.spacing(3)}
    ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(3)};
`;

const StyledShowTopLeftImageInsideContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 12px;

  img {
    border-radius: 4px;
    height: 40px;
    width: 40px;
  }

  div {
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
`;

const StyledDate = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-style: normal;
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: 120%;
`;

const StyledTooltip = styled(Tooltip)`
  background-color: ${({ theme }) => theme.background.primary};

  box-shadow: 0px 2px 4px 3px
    ${({ theme }) => theme.background.transparent.light};

  box-shadow: 2px 4px 16px 6px
    ${({ theme }) => theme.background.transparent.light};

  color: ${({ theme }) => theme.font.color.primary};

  opacity: 1;
  padding: 8px;
`;

export function TopLeftHeaderOnShowPage({
  logo,
  title,
  date,
}: {
  logo: string;
  title: string;
  date: string;
}) {
  if (!date) {
    return null;
  }
  const beautifiedCreatedAt = beautifyPastDateRelativeToNow(date);
  const exactCreatedAt = beautifyExactDate(date);

  return (
    <StyledShowTopLeftImageContainer>
      <StyledShowTopLeftImageInsideContainer>
        <img src={logo} alt="Logo or Avatar" />
        <div>
          <StyledTitle>{title}</StyledTitle>
          <StyledDate id={`id-${title}`}>
            Added {beautifiedCreatedAt} ago
          </StyledDate>
          <StyledTooltip
            anchorSelect={`#id-${title}`}
            content={exactCreatedAt}
            clickable
            noArrow
          />
        </div>
      </StyledShowTopLeftImageInsideContainer>
    </StyledShowTopLeftImageContainer>
  );
}

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
