import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

const IMAGE_MIN_WIDTH = 32;
const IMAGE_MAX_WIDTH = 600;

const StyledNodeViewWrapper = styled(NodeViewWrapper)`
  height: 100%;
  ${({ align }) => {
    switch (align) {
      case 'left':
        return css`
          margin-left: 0;
        `;
      case 'right':
        return css`
          margin-right: 0;
        `;
      case 'center':
        return css`
          margin-left: auto;
          margin-right: auto;
        `;
    }
  }}
`;

const StyledImageWrapper = styled.div<{ width?: number }>`
  height: 100%;
`;

const StyledImageContainer = styled.div`
  max-width: 100%;
  position: relative;
`;

const StyledImage = styled.img`
  height: auto;
  max-width: 100%;
`;

const StyledImageHandle = styled.div<{ handle: 'left' | 'right' }>`
  border-radius: ${({ theme }) => theme.border.radius.md};
  background-color: ${({ theme }) => theme.background.primaryInverted};
  border: 1px solid ${({ theme }) => theme.background.primary};
  cursor: col-resize;
  height: ${({ theme }) => theme.spacing(8)};
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: ${({ theme }) => theme.spacing(2)};
  z-index: 1;

  ${({ handle }) => {
    if (handle === 'left') {
      return css`
        left: 2px;
      `;
    }

    return css`
      right: 2px;
    `;
  }}
`;

type ResizeParams = {
  initialWidth: number;
  initialClientX: number;
  handleUsed: 'left' | 'right';
};

type ResizableImageViewProps = NodeViewProps;

export const ResizableImageView = (props: ResizableImageViewProps) => {
  const { editor, node, updateAttributes } = props;
  const { width: initialWidth, align = 'left', src, alt } = node.attrs;

  const imageWrapperRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [width, setWidth] = useState(initialWidth || 0);
  const [resizeParams, setResizeParams] = useState<ResizeParams | null>(null);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const imageWrapper = imageWrapperRef.current;
      if (!isDefined(resizeParams) || !isDefined(imageWrapper)) {
        return;
      }

      const deltaX = event.clientX - resizeParams.initialClientX;
      const { initialWidth, handleUsed } = resizeParams;

      let newWidth =
        align === 'center'
          ? initialWidth + (handleUsed === 'left' ? -deltaX * 2 : deltaX * 2)
          : initialWidth + (handleUsed === 'left' ? -deltaX : deltaX);

      const maxWidth =
        editor.view.dom.firstElementChild?.clientWidth || IMAGE_MAX_WIDTH;
      newWidth = Math.min(Math.max(newWidth, IMAGE_MIN_WIDTH), maxWidth);

      setWidth(newWidth);
      imageWrapper.style.width = `${newWidth}px`;
    },
    [resizeParams, editor, align],
  );

  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      const imageWrapper = imageWrapperRef.current;
      if (!isDefined(imageWrapper) || !isDefined(resizeParams)) {
        return;
      }

      if (
        (!event.target || !imageWrapper.contains(event.target as Node)) &&
        isDragging
      ) {
        setIsDragging(false);
        return;
      }

      setResizeParams(null);
      updateAttributes({ width });
    },
    [resizeParams, updateAttributes, width, isDragging, setIsDragging],
  );

  const handleImageHandleMouseDown = useCallback(
    (handle: 'left' | 'right', event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();

      setResizeParams({
        initialWidth: imageWrapperRef.current?.clientWidth ?? IMAGE_MAX_WIDTH,
        initialClientX: event.clientX,
        handleUsed: handle,
      });
    },
    [],
  );

  const handleWrapperMouseEnter = useCallback(() => {
    if (!editor.isEditable) {
      return;
    }

    setIsDragging(true);
  }, [setIsDragging, editor.isEditable]);

  const handleWrapperMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, [setIsDragging]);

  useEffect(() => {
    const abortController = new AbortController();

    window.addEventListener('mouseup', handleMouseUp, {
      signal: abortController.signal,
    });
    window.addEventListener('mousemove', handleMouseMove, {
      signal: abortController.signal,
    });

    return () => {
      abortController.abort();
    };
  }, [handleMouseUp, handleMouseMove]);

  return (
    <StyledNodeViewWrapper
      onMouseEnter={handleWrapperMouseEnter}
      onMouseLeave={handleWrapperMouseLeave}
      align={align}
    >
      <StyledImageWrapper
        ref={imageWrapperRef}
        style={{ width: width ? `${width}px` : 'fit-content' }}
      >
        <StyledImageContainer>
          <StyledImage
            src={src}
            alt={alt}
            draggable={false}
            contentEditable={false}
          />
          {(isDragging || isDefined(resizeParams)) && (
            <>
              <StyledImageHandle
                handle="left"
                onMouseDown={(e) => handleImageHandleMouseDown('left', e)}
              />
              <StyledImageHandle
                handle="right"
                onMouseDown={(e) => handleImageHandleMouseDown('right', e)}
              />
            </>
          )}
        </StyledImageContainer>
      </StyledImageWrapper>
    </StyledNodeViewWrapper>
  );
};
