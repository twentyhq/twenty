import { useEffect, useRef } from 'react';
import RingToneManager from '../utils/RingToneManager';

// Hook personalizado para usar o RingToneManager
export const useRingTone = (isRinging: boolean, isIncomingCall: boolean) => {
  const managerRef = useRef<RingToneManager | null>(null);

  useEffect(() => {
    // Cria uma única instância do manager
    if (!managerRef.current) {
      managerRef.current = new RingToneManager();
    }

    // Inicia ou para o tom de acordo com o estado
    if (isRinging) {
      managerRef.current.start();
    } else {
      managerRef.current.stop();
    }

    // Inicia ou para o tom de chamada recebida
    if (isIncomingCall) {
      managerRef.current.startCallTone();
    } else {
      managerRef.current.stopCallTone();
    }

    // Cleanup ao desmontar
    return () => {
      if (managerRef.current) {
        managerRef.current.stop();
        managerRef.current.stopCallTone();
      }
    };
  }, [isRinging, isIncomingCall]);
};