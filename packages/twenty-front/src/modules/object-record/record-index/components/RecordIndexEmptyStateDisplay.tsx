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

type RecordIndexEmptyStateDisplayProps = {
  animatedPlaceholderType: AnimatedPlaceholderType;
  title: string;
  subTitle: string;
  ButtonIcon?: IconComponent;
  buttonTitle?: string;
  onButtonClick?: () => void;
  width?: number;
};

export const RecordIndexEmptyStateDisplay = ({
  animatedPlaceholderType,
  title,
  subTitle,
  ButtonIcon,
  buttonTitle,
  onButtonClick,
  width,
}: RecordIndexEmptyStateDisplayProps) => (
  <StyledEmptyStateContainer>
    <AnimatedPlaceholderEmptyContainer width={width}>
      <AnimatedPlaceholder type={animatedPlaceholderType} />
      <AnimatedPlaceholderEmptyTextContainer>
        <AnimatedPlaceholderEmptyTitle>{title}</AnimatedPlaceholderEmptyTitle>
        <AnimatedPlaceholderEmptySubTitle>
          {subTitle}
        </AnimatedPlaceholderEmptySubTitle>
      </AnimatedPlaceholderEmptyTextContainer>
      {isDefined(onButtonClick) && (
        <Button
          Icon={ButtonIcon}
          title={buttonTitle}
          variant="secondary"
          onClick={onButtonClick}
        />
      )}
    </AnimatedPlaceholderEmptyContainer>
  </StyledEmptyStateContainer>
);
