/* eslint-disable @nx/workspace-no-hardcoded-colors */
/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
/* eslint-disable no-console */
import { useTheme } from '@emotion/react';
import React, { useState } from 'react';
import { Session } from 'sip.js';
import { IconArrowRight, IconCheck } from 'twenty-ui';

interface TransferButtonProps {
  session: Session | null;
  type: 'attended' | 'blind';
  sendDTMF: (tone: string) => void;
}

const TransferButton: React.FC<TransferButtonProps> = ({ type, sendDTMF }) => {
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = () => {
    const extension = window.prompt('Enter the extension to transfer to:');

    console.log('Extension to transfer:', extension);
    console.log('Type of transfer:', type);

    if (extension) {
      if (type === 'attended') {
        sendDTMF(`${extension}`);
      } else {
        sendDTMF(`${extension}`);
      }
      setIsTransferring(true);
    }
  };

  const handleCompleteTransfer = () => {
    // const extension = window.prompt('Enter the extension to transfer to:');

    setIsTransferring(false);
  };

  const theme = useTheme();

  return (
    <>
      {isTransferring ? (
        <IconCheck
          onClick={handleCompleteTransfer}
          size={theme.icon.size.lg}
          stroke={theme.icon.stroke.sm}
          color={theme.font.color.secondary}
          style={{
            cursor: 'pointer',
            padding: theme.spacing(3),
            borderRadius: '50%',
            border: `1px solid #fff`,
          }}
        />
      ) : (
        <IconArrowRight
          onClick={handleTransfer}
          size={theme.icon.size.lg}
          stroke={theme.icon.stroke.sm}
          color={theme.font.color.secondary}
          style={{
            cursor: 'pointer',
            padding: theme.spacing(3),
            borderRadius: '50%',
            border: `1px solid #fff`,
          }}
        />
      )}
    </>
  );
};

export default TransferButton;
