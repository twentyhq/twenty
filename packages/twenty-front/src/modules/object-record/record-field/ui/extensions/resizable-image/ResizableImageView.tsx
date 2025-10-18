import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import React, { useCallback, useRef, useState } from 'react';
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

  ${({ handle, theme }) => {
    if (handle === 'left') {
      return css`
        left: ${theme.spacing(1)};
      `;
    }

    return css`
      right: ${theme.spacing(1)};
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

  // Controls visibility of resize handles when hovering over the image
  const [isHovering, setIsHovering] = useState(false);
  const [width, setWidth] = useState(initialWidth || 0);
  // Controls actual resize operation state (null = not resizing, object = actively resizing)
  const [resizeParams, setResizeParams] = useState<ResizeParams | null>(null);

  // Create stable event handlers using a closure approach
  const createMouseHandlers = useCallback(() => {
    let currentResizeParams: ResizeParams | null = null;

    const handleMouseMove = (event: MouseEvent) => {
      const imageWrapper = imageWrapperRef.current;

      if (!isDefined(currentResizeParams) || !isDefined(imageWrapper)) {
        return;
      }

      const deltaX = event.clientX - currentResizeParams.initialClientX;
      const { initialWidth, handleUsed } = currentResizeParams;

      let newWidth =
        align === 'center'
          ? initialWidth + (handleUsed === 'left' ? -deltaX * 2 : deltaX * 2)
          : initialWidth + (handleUsed === 'left' ? -deltaX : deltaX);

      const maxWidth =
        editor.view.dom.firstElementChild?.clientWidth || IMAGE_MAX_WIDTH;
      newWidth = Math.min(Math.max(newWidth, IMAGE_MIN_WIDTH), maxWidth);

      setWidth(newWidth);
      imageWrapper.style.width = `${newWidth}px`;
    };

    const handleMouseUp = (event: MouseEvent) => {
      const imageWrapper = imageWrapperRef.current;

      if (!isDefined(imageWrapper) || !isDefined(currentResizeParams)) {
        return;
      }

      if (
        (!event.target || !imageWrapper.contains(event.target as Node)) &&
        isHovering
      ) {
        setIsHovering(false);
        return;
      }

      const finalWidth = imageWrapper.clientWidth;
      currentResizeParams = null;
      setResizeParams(null);
      updateAttributes({ width: finalWidth });

      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    const startResize = (resizeParams: ResizeParams) => {
      currentResizeParams = resizeParams;
      setResizeParams(resizeParams);

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    };

    return { startResize };
  }, [editor, align, isHovering, updateAttributes]);

  const { startResize } = createMouseHandlers();

  const handleImageHandleMouseDown = useCallback(
    (handle: 'left' | 'right', event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();

      const resizeParams = {
        initialWidth: imageWrapperRef.current?.clientWidth ?? IMAGE_MAX_WIDTH,
        initialClientX: event.clientX,
        handleUsed: handle,
      };

      startResize(resizeParams);
    },
    [startResize],
  );

  const handleImageHover = useCallback(() => {
    if (!editor.isEditable) {
      return;
    }

    setIsHovering(true);
  }, [editor.isEditable]);

  const handleImageHoverEnd = useCallback(() => {
    setIsHovering(false);
  }, []);

  return (
    <StyledNodeViewWrapper
      onMouseEnter={handleImageHover}
      onMouseLeave={handleImageHoverEnd}
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
          {/* Show resize handles when hovering over image OR actively resizing */}
          {(isHovering || isDefined(resizeParams)) && (
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
