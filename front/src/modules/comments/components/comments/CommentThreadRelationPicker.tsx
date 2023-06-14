import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { CommentThreadForDrawer } from '@/comments/types/CommentThreadForDrawer';
import CompanyChip from '@/companies/components/CompanyChip';
import { IconArrowUpRight, IconPlus } from '@/ui/icons';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import { useGetCompaniesQuery } from '~/generated/graphql';

type OwnProps = {
  commentThread: CommentThreadForDrawer;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${(props) => props.theme.spacing(2)};
  justify-content: flex-start;
`;

const StyledRelationLabel = styled.div`
  color: ${(props) => props.theme.text60};
  display: flex;
  flex-direction: row;
`;

const StyledRelationContainer = styled.div`
  --horizontal-padding: ${(props) => props.theme.spacing(1)};
  --vertical-padding: ${(props) => props.theme.spacing(1.5)};

  border: 1px solid ${(props) => props.theme.lightBorder};

  border: 1px solid transparent;
  display: flex;

  gap: ${(props) => props.theme.spacing(2)};
  height: calc(32px - 2 * var(--vertical-padding));

  padding: var(--vertical-padding) var(--horizontal-padding);

  &:hover {
    background-color: ${(props) => props.theme.secondaryBackground};
  }

  width: calc(100% - 2 * var(--horizontal-padding));
`;

// TODO: refactor icon button with new figma and merge
const StyledAddButton = styled.div`
  align-items: center;
  background: ${(props) => props.theme.primaryBackgroundTransparent};
  border-radius: ${(props) => props.theme.borderRadius};
  box-shadow: ${(props) => props.theme.modalBoxShadow};

  cursor: pointer;
  display: flex;
  flex-direction: row;

  &:hover {
    background-color: ${(props) => props.theme.tertiaryBackground};
  }

  height: 20px;
  justify-content: center;

  width: 20px;
`;

export function CommentThreadRelationPicker({ commentThread }: OwnProps) {
  const theme = useTheme();

  const companyIds = commentThread.commentThreadTargets
    ?.filter((relation) => relation.commentableType === 'Company')
    .map((relation) => relation.commentableId);

  const personIds = commentThread.commentThreadTargets
    ?.filter((relation) => relation.commentableType === 'Person')
    .map((relation) => relation.commentableId);

  const { data } = useGetCompaniesQuery({
    variables: {
      where: {
        id: {
          in: companyIds,
        },
      },
    },
  });
  console.log({ companyIds, personIds, data });

  const companies = data?.companies ?? [];

  return (
    <StyledContainer>
      <IconArrowUpRight size={32} color={theme.text40} strokeWidth={1.5} />
      <StyledRelationLabel>Relations</StyledRelationLabel>
      <StyledRelationContainer>
        {companies?.map((company) => (
          <CompanyChip
            key={company.id}
            name={company.name}
            picture={getLogoUrlFromDomainName(company.domainName)}
          />
        ))}
        <StyledAddButton id="add-button">
          <IconPlus size={14} color={theme.text40} strokeWidth={1.5} />
        </StyledAddButton>
      </StyledRelationContainer>
    </StyledContainer>
  );
}
