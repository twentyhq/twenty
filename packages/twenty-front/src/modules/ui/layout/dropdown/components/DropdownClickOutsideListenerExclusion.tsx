import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';

const StyledClickOutsideListenerExclusion = styled.div`
  display: contents;
`;

type DropdownClickOutsideListenerExclusionProps = {
  children: ReactNode;
};

export const DropdownClickOutsideListenerExclusion = ({
  children,
}: DropdownClickOutsideListenerExclusionProps) => {
  const { excludedClickOutsideId } = useContext(ClickOutsideListenerContext);

  if (!isDefined(excludedClickOutsideId)) {
    return children;
  }

  return (
    <StyledClickOutsideListenerExclusion
      data-click-outside-id={excludedClickOutsideId}
    >
      {children}
    </StyledClickOutsideListenerExclusion>
  );
};
