import { type ReactNode, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';

type TemplateDimensionsEffectProps = {
  children: (
    dimensions: { height: number; width: number } | undefined,
  ) => ReactNode;
  template?: ReactNode;
};

const StyledTemplateWrapper = styled.span`
  pointer-events: none;
  position: fixed;
  visibility: hidden;
`;

export const TemplateDimensionsEffect = ({
  children,
  template = children(undefined),
}: TemplateDimensionsEffectProps) => {
  const templateWrapperRef = useRef<HTMLSpanElement>(null);
  const [templateDimensions, setTemplateDimensions] = useState<
    | {
        width: number;
        height: number;
      }
    | undefined
  >(undefined);

  useEffect(() => {
    templateWrapperRef.current &&
      setTemplateDimensions({
        width: templateWrapperRef.current.offsetWidth,
        height: templateWrapperRef.current.offsetHeight,
      });
  }, [template]);

  return (
    <>
      <StyledTemplateWrapper ref={templateWrapperRef}>
        {template}
      </StyledTemplateWrapper>
      {children(templateDimensions)}
    </>
  );
};
