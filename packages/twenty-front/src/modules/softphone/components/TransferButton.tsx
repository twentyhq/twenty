/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
/* eslint-disable no-console */
import { ArrowRight, Check } from 'lucide-react';
import React, { useState } from 'react';
import { Session } from 'sip.js';

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

  return (
    <div className="relative">
      {isTransferring ? (
        <button
          onClick={handleCompleteTransfer}
          className="p-2 rounded-full hover:bg-green-50 text-green-600"
        >
          <Check className="w-5 h-5" />
        </button>
      ) : (
        <button
          onClick={handleTransfer}
          className="p-2 rounded-full hover:bg-blue-50 text-blue-600"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default TransferButton;
