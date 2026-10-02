import { FieldInputAnchorContextProvider } from '@/object-record/record-field/ui/contexts/FieldInputAnchorContext';
import { getFieldInputAnchorPosition } from '@/object-record/record-field/ui/utils/getFieldInputAnchorPosition';
import { type Decorator } from '@storybook/react-vite';
import { useRef } from 'react';

export const FieldInputAnchorDecorator: Decorator = (Story) => {
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <FieldInputAnchorContextProvider
      value={getFieldInputAnchorPosition({
        anchorRef,
        sideOffset: -33,
        alignOffset: -3,
        collisionPadding: 0,
      })}
    >
      <div style={{ height: 400, padding: 40 }}>
        <div ref={anchorRef} style={{ height: 32, width: 200 }} />
        <Story />
      </div>
    </FieldInputAnchorContextProvider>
  );
};
