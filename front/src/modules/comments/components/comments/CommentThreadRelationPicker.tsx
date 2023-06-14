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
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: ${(props) => props.theme.spacing(2)};
`;

const StyledRelationLabel = styled.div`
  display: flex;
  flex-direction: row;
  color: ${(props) => props.theme.text60};
`;

const StyledRelationContainer = styled.div`
  --horizontal-padding: ${(props) => props.theme.spacing(1)};
  --vertical-padding: ${(props) => props.theme.spacing(1.5)};

  padding: var(--vertical-padding) var(--horizontal-padding);

  width: calc(100% - 2 * var(--horizontal-padding));
  height: calc(32px - 2 * var(--vertical-padding));

  display: flex;
  gap: ${(props) => props.theme.spacing(2)};

  border: 1px solid transparent;

  &:hover {
    background-color: ${(props) => props.theme.secondaryBackground};
  }

  border: 1px solid ${(props) => props.theme.lightBorder};
`;

// TODO: refactor icon button with new figma and merge
const StyledAddButton = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  border-radius: ${(props) => props.theme.borderRadius};
  background: ${(props) => props.theme.primaryBackgroundTransparent};
  box-shadow: ${(props) => props.theme.modalBoxShadow};

  &:hover {
    background-color: ${(props) => props.theme.tertiaryBackground};
  }

  width: 20px;
  height: 20px;

  cursor: pointer;
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
