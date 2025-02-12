import { SettingsPath } from '@/types/SettingsPath';
import styled from '@emotion/styled';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  Button,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
  IconPlus,
} from 'twenty-ui';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledEmptyFunctionsContainer = styled.div`
  height: 60vh;
`;

export const SettingsServerlessFunctionsTableEmpty = () => {
  return (
    <StyledEmptyFunctionsContainer>
      <AnimatedPlaceholderEmptyContainer
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
      >
        <AnimatedPlaceholder type="emptyFunctions" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            Add your first Function
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            Add your first Function to get started
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
        <Button
          Icon={IconPlus}
          title="New function"
          to={getSettingsPath(SettingsPath.NewServerlessFunction)}
        />
      </AnimatedPlaceholderEmptyContainer>
    </StyledEmptyFunctionsContainer>
  );
};
