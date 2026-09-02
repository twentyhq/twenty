import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  type AnimatedPlaceholderType,
} from 'twenty-ui/feedback';
import { type IconComponent } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

const StyledEmptyStateContainer = styled.div`
  height: 100%;
  width: 100%;
`;

type RecordListEmptyStateDisplayProps = {
  animatedPlaceholderType: AnimatedPlaceholderType;
  title: string;
  subTitle: string;
  ButtonIcon?: IconComponent;
  buttonTitle?: string;
  buttonIsDisabled?: boolean;
  onButtonClick?: () => void;
};

export const RecordListEmptyStateDisplay = ({
  animatedPlaceholderType,
  title,
  subTitle,
  ButtonIcon,
  buttonTitle,
  buttonIsDisabled = false,
  onButtonClick,
}: RecordListEmptyStateDisplayProps) => (
  <StyledEmptyStateContainer>
    <AnimatedPlaceholderEmptyContainer>
      <AnimatedPlaceholder type={animatedPlaceholderType} />
      <AnimatedPlaceholderEmptyTextContainer>
        <AnimatedPlaceholderEmptyTitle>{title}</AnimatedPlaceholderEmptyTitle>
        <AnimatedPlaceholderEmptySubTitle>
          {subTitle}
        </AnimatedPlaceholderEmptySubTitle>
      </AnimatedPlaceholderEmptyTextContainer>
      {isDefined(buttonTitle) && (
        <Button
          Icon={ButtonIcon}
          title={buttonTitle}
          variant="secondary"
          onClick={onButtonClick}
          disabled={buttonIsDisabled}
        />
      )}
    </AnimatedPlaceholderEmptyContainer>
  </StyledEmptyStateContainer>
);
