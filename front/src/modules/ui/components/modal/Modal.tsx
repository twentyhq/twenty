import React from 'react';
import ReactModal from 'react-modal';
import { useTheme } from '@emotion/react';

export function Modal({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <ReactModal
      isOpen
      ariaHideApp={false}
      style={{
        overlay: {
          backgroundColor: theme.background.overlay,
          zIndex: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
        content: { zIndex: 1000, minWidth: 200, inset: 'auto', padding: 0 },
      }}
    >
      {children}
    </ReactModal>
  );
}
