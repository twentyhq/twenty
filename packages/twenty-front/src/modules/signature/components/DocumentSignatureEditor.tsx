import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Document, Page } from 'react-pdf';
import {
  IconCalendar,
  IconCheckbox,
  IconChevronLeft,
  IconChevronRight,
  IconLetterCaseUpper,
  IconMinus,
  IconPlus,
  IconSignature,
  IconTextScan2,
  IconX,
} from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

import { CreateSignatureFormValues } from '~/pages/SignaturePage/SignaturePage';

enum SignatureType {
  SIGNATURE = 1,
  INITIALS = 2,
  DATE = 3,
  TEXT = 4,
  CHECKBOX = 5,
}

const MapSignatureTypeToIcon = {
  [SignatureType.SIGNATURE]: <IconSignature size={16} />,
  [SignatureType.INITIALS]: <IconLetterCaseUpper size={16} />,
  [SignatureType.DATE]: <IconCalendar size={16} />,
  [SignatureType.TEXT]: <IconTextScan2 size={16} />,
  [SignatureType.CHECKBOX]: <IconCheckbox size={16} />,
};

const StyledPdfWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const StyledPdfControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.font.color.primary};
  margin-top: ${({ theme }) => theme.spacing(2)};
  position: absolute;
  bottom: ${({ theme }) => theme.spacing(2)};
  left: ${({ theme }) => theme.spacing(2)};
  background-color: transparent;
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.background.primary};
  }
`;

const StyledPage = styled(Page)`
  position: relative;
`;

const StyledSignatureBox = styled.div<{
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}>`
  align-items: flex-start;
  border: 2px solid ${({ color }) => color};
  cursor: move;
  display: flex;
  flex-direction: column;
  height: ${({ height }) => height}px;
  left: ${({ x }) => x}px;
  padding: ${({ theme }) => theme.spacing(2)};
  position: absolute;
  top: ${({ y }) => y}px;
  user-select: none;
  width: ${({ width }) => width}px;
`;

const StyledSignatureName = styled.span<{
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}>`
  background: ${({ color }) => color};
  border-radius: 4px;
  color: ${({ theme }) => theme.font.color.inverted};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  left: ${({ x }) => x}px;
  padding: 2px 8px;
  pointer-events: none;
  position: absolute;
  text-align: left;
  top: ${({ y, height }) => y + height + 18}px;
  width: ${({ width }) => width}px;
`;

const StyledSignatureRemoveButton = styled(IconButton)<{
  x: number;
  y: number;
  width: number;
}>`
  position: absolute;
  left: ${({ x, width }) => x + width + 6}px;
  top: ${({ y }) => y - 12}px;
  z-index: 11;
  background: ${({ theme }) => theme.color.red};
  color: ${({ theme }) => theme.font.color.inverted};
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: ${({ theme }) => theme.color.red50};
  }
`;

const StyledResizeHandle = styled.div<{
  color: string;
  height: number;
  width: number;
  x: number;
  y: number;
}>`
  align-items: center;
  cursor: se-resize;
  display: flex;
  height: 15px;
  justify-content: center;
  left: ${({ x, width }) => x + width + 10}px;
  position: absolute;
  top: ${({ y, height }) => y + height + 10}px;
  width: 15px;
  z-index: 10;
`;

type DocumentSignatureEditorProps = {
  onPageChange?: (pageIndex: number) => void;
  pageNumber: number;
  numPages: number;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  setNumPages: React.Dispatch<React.SetStateAction<number>>;
  attachment: ObjectRecord;
};

export const DocumentSignatureEditor = ({
  onPageChange,
  pageNumber,
  numPages,
  setPageNumber,
  setNumPages,
  attachment,
}: DocumentSignatureEditorProps) => {
  const { watch, setValue } = useFormContext<CreateSignatureFormValues>();
  const signees = watch('signees');
  const signatures = watch('signatures') || [];
  const [scale, setScale] = useState(1);
  const [draggedBox, setDraggedBox] = useState<{
    signatureIndex: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [resizingBox, setResizingBox] = useState<{
    signatureIndex: number;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  useEffect(() => {
    onPageChange?.(pageNumber - 1);
  }, [pageNumber, onPageChange]);

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages ?? prev));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent, signatureIndex: number) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
    const page = e.currentTarget
      .closest('.react-pdf__Page')
      ?.getBoundingClientRect();
    if (!page) return;
    const signature = signatures.find((s) => s.index === signatureIndex);
    if (!signature) return;
    const offsetX = (e.clientX - page.left) / scale - signature.x;
    const offsetY = (e.clientY - page.top) / scale - signature.y;
    setDraggedBox({
      signatureIndex,
      offsetX,
      offsetY,
    });
  };

  const handleResizeMouseDown = (
    e: React.MouseEvent,
    signatureIndex: number,
  ) => {
    e.stopPropagation();
    const page = document
      .querySelector('.react-pdf__Page')
      ?.getBoundingClientRect();
    if (!page) return;
    const signature = signatures.find((s) => s.index === signatureIndex);
    if (!signature) return;

    setResizingBox({
      signatureIndex,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: signature.width,
      startHeight: signature.height,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (resizingBox !== null) {
      const deltaX = (e.clientX - resizingBox.startX) / scale;
      const deltaY = (e.clientY - resizingBox.startY) / scale;

      const newWidth = Math.max(50, resizingBox.startWidth + deltaX);
      const newHeight = Math.max(30, resizingBox.startHeight + deltaY);

      const newSignatures = signatures.map((signature) => {
        if (signature.index === resizingBox.signatureIndex) {
          return {
            ...signature,
            width: newWidth,
            height: newHeight,
          };
        }
        return signature;
      });
      setValue('signatures', newSignatures);
      return;
    }

    if (draggedBox === null) return;
    const page = document
      .querySelector('.react-pdf__Page')
      ?.getBoundingClientRect();
    if (!page) return;
    const newX = (e.clientX - page.left) / scale - draggedBox.offsetX;
    const newY = (e.clientY - page.top) / scale - draggedBox.offsetY;
    const newSignatures = signatures.map((signature) => {
      if (signature.index === draggedBox.signatureIndex) {
        return {
          ...signature,
          x: newX,
          y: newY,
        };
      }
      return signature;
    });
    setValue('signatures', newSignatures);
  };

  const handleMouseUp = () => {
    setDraggedBox(null);
    setResizingBox(null);
  };

  const handleRemoveSignature = (signatureIndex: number) => {
    const newSignatures = signatures.filter(
      (signature) => signature.index !== signatureIndex,
    );
    setValue('signatures', newSignatures);
  };

  return (
    <StyledPdfWrapper
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Document
        file={attachment.fullPath}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <StyledPage
          pageNumber={pageNumber}
          scale={scale}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        >
          {signatures
            .filter((signature) => signature.page_index === pageNumber - 1)
            .map((signature) => {
              const signee = signees.find((s) => s.id === signature.signee_id);
              if (!signee) return null;

              const scaledX = signature.x * scale;
              const scaledY = signature.y * scale;
              const scaledWidth = signature.width * scale;
              const scaledHeight = signature.height * scale;

              return (
                <>
                  <StyledSignatureName
                    x={scaledX}
                    y={scaledY}
                    width={scaledWidth}
                    height={scaledHeight}
                    color={signee.color}
                    key={`name-${signature.index}`}
                  >
                    {signature.name}
                  </StyledSignatureName>
                  <StyledSignatureRemoveButton
                    x={scaledX}
                    y={scaledY}
                    width={scaledWidth}
                    Icon={IconX}
                    key={`remove-${signature.index}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSignature(signature.index);
                    }}
                    variant="tertiary"
                    size="small"
                  />
                  <StyledSignatureBox
                    key={`box-${signature.index}`}
                    x={scaledX}
                    y={scaledY}
                    width={scaledWidth}
                    height={scaledHeight}
                    color={signee.color}
                    onMouseDown={(e) => handleMouseDown(e, signature.index)}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                      }}
                    >
                      {
                        MapSignatureTypeToIcon[
                          Number(
                            signature.field_type + 1,
                          ) as keyof typeof MapSignatureTypeToIcon
                        ]
                      }
                    </div>
                  </StyledSignatureBox>
                  <StyledResizeHandle
                    key={`resize-${signature.index}`}
                    x={scaledX}
                    y={scaledY}
                    width={scaledWidth}
                    height={scaledHeight}
                    color={signee.color}
                    className="resize-handle"
                    onMouseDown={(e) =>
                      handleResizeMouseDown(e, signature.index)
                    }
                  />
                </>
              );
            })}
        </StyledPage>
      </Document>
      <StyledPdfControls>
        <IconButton
          Icon={IconChevronLeft}
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
          variant="tertiary"
        />
        <span>
          Page {pageNumber} of {numPages ?? '?'}
        </span>
        <IconButton
          Icon={IconChevronRight}
          onClick={goToNextPage}
          disabled={pageNumber >= (numPages ?? pageNumber)}
          variant="tertiary"
        />
        <IconButton
          Icon={IconMinus}
          onClick={zoomOut}
          disabled={scale <= 0.5}
          variant="tertiary"
        />
        <span>{Math.round(scale * 100)}%</span>
        <IconButton
          Icon={IconPlus}
          onClick={zoomIn}
          disabled={scale >= 2}
          variant="tertiary"
        />
      </StyledPdfControls>
    </StyledPdfWrapper>
  );
};
