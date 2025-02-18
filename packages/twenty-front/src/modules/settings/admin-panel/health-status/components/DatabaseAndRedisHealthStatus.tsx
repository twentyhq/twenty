import styled from '@emotion/styled';
import { Section } from 'twenty-ui';
import {
  AdminPanelIndicatorHealthStatusInputEnum,
  useGetIndicatorHealthStatusQuery,
} from '~/generated/graphql';

const StyledDetailsContainer = styled.pre`
  background-color: ${({ theme }) => theme.background.quaternary};
  padding: ${({ theme }) => theme.spacing(6)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  white-space: pre-wrap;
  font-size: ${({ theme }) => theme.font.size.sm};
`;
export const DatabaseAndRedisHealthStatus = ({
  indicatorName,
}: {
  indicatorName: AdminPanelIndicatorHealthStatusInputEnum;
}) => {
  const { data } = useGetIndicatorHealthStatusQuery({
    variables: {
      indicatorName: indicatorName as AdminPanelIndicatorHealthStatusInputEnum,
    },
    fetchPolicy: 'network-only',
  });

  const formattedDetails = data?.getIndicatorHealthStatus.details
    ? JSON.stringify(JSON.parse(data.getIndicatorHealthStatus.details), null, 2)
    : null;

  return (
    <Section>
      <StyledDetailsContainer>{formattedDetails}</StyledDetailsContainer>
    </Section>
  );
};
