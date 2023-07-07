import { ChangeEvent, ComponentType, ReactNode, useRef, useState } from 'react';
import styled from '@emotion/styled';

import { textInputStyle } from '@/ui/themes/effects';

import { InplaceInput } from '../InplaceInput';

export type OwnProps = {
  placeholder?: string;
  value: string;
  picture: string;
  changeHandler: (updated: string) => void;
  editModeHorizontalAlign?: 'left' | 'right';
  ChipComponent: ComponentType<{
    name: string;
    picture: string;
    isOverlapped?: boolean;
  }>;
  commentCount?: number;
  onCommentClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  rightEndContents?: ReactNode[];
  setSoftFocusOnCurrentInplaceInput?: () => void;
  hasSoftFocus?: boolean;
};

// TODO: refactor
const StyledInplaceInput = styled.input`
  width: 100%;

  ${textInputStyle}
`;

const NoEditModeContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const RightContainer = styled.div`
  margin-left: ${(props) => props.theme.spacing(1)};
`;

export function InplaceChipInput({
  value,
  placeholder,
  changeHandler,
  picture,
  editModeHorizontalAlign,
  ChipComponent,
  rightEndContents,
  setSoftFocusOnCurrentInplaceInput,
  hasSoftFocus,
}: OwnProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);

  const handleRightEndContentClick = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    event.stopPropagation();
  };

  return (
    <InplaceInput
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <StyledInplaceInput
          placeholder={placeholder || ''}
          autoFocus
          ref={inputRef}
          value={inputValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setInputValue(event.target.value);
            changeHandler(event.target.value);
          }}
        />
      }
      nonEditModeContent={
        <NoEditModeContainer>
          <ChipComponent name={inputValue} picture={picture} />
          <RightContainer>
            {rightEndContents &&
              rightEndContents.length > 0 &&
              rightEndContents.map((content, index) => (
                <div key={index} onClick={handleRightEndContentClick}>
                  {content}
                </div>
              ))}
          </RightContainer>
        </NoEditModeContainer>
      }
      setSoftFocusOnCurrentInplaceInput={setSoftFocusOnCurrentInplaceInput}
      hasSoftFocus={hasSoftFocus}
    />
  );
}
