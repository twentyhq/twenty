/* eslint-disable @nx/workspace-no-hardcoded-colors */
/* eslint-disable no-console */
/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { useTheme } from '@emotion/react';
import React from 'react';
import { Session, SessionState } from 'sip.js';
import { SessionDescriptionHandler } from 'sip.js/lib/platform/web';
import { useIcons } from 'twenty-ui/display';
import { CallState } from '../types/callState';

interface HoldButtonProps {
  session: Session | null;
  isOnHold: boolean;
  setCallState: React.Dispatch<React.SetStateAction<CallState>>;
  callState: CallState;
}

const HoldButton: React.FC<HoldButtonProps> = ({
  session,
  isOnHold,
  setCallState,
  callState,
}) => {
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const holdAudioTrackRef = React.useRef<MediaStreamTrack | null>(null);
  const originalAudioTrackRef = React.useRef<MediaStreamTrack | null>(null);

  const replaceAudioTrack = async (
    peerConnection: RTCPeerConnection,
    newTrack: MediaStreamTrack | null,
  ) => {
    if (!newTrack) return;
    const audioSender = peerConnection
      .getSenders()
      .find((sender) => sender.track?.kind === 'audio');
    if (audioSender) {
      await audioSender.replaceTrack(newTrack);
    }
  };

  const handleHold = async () => {
    if (!session || session.state !== SessionState.Established) {
      console.log('Session is not established.');
      return;
    }

    try {
      const sdh = session.sessionDescriptionHandler as
        | SessionDescriptionHandler
        | undefined;
      if (!sdh) {
        console.log('SessionDescriptionHandler não disponível.');
        return;
      }

      const peerConnection = sdh?.peerConnection;

      if (!peerConnection) {
        console.log('PeerConnection não está disponível.');
        return;
      }

      const audioSender = peerConnection
        .getSenders()
        .find((sender) => sender.track?.kind === 'audio');

      if (!originalAudioTrackRef.current && audioSender?.track) {
        // Armazena a trilha original do microfone na primeira execução
        originalAudioTrackRef.current = audioSender.track;
      }

      if (isOnHold) {
        console.log('Unholding call...');
        // Reativa a trilha do microfone
        if (originalAudioTrackRef.current) {
          originalAudioTrackRef.current.enabled = !callState.isMuted;
          await replaceAudioTrack(
            peerConnection,
            originalAudioTrackRef.current,
          );
        }

        // Para e libera a música de espera
        if (holdAudioTrackRef.current) {
          holdAudioTrackRef.current.stop();
          holdAudioTrackRef.current = null;
        }

        setCallState((prev) => ({ ...prev, isOnHold: false }));
      } else {
        console.log('Holding call...');
        // Desativa o microfone imediatamente
        if (originalAudioTrackRef.current) {
          originalAudioTrackRef.current.enabled = false;
        }

        // Cria o contexto de áudio se necessário
        if (
          !audioContextRef.current ||
          audioContextRef.current.state === 'closed'
        ) {
          audioContextRef.current = new AudioContext();
        }

        const audioContext = audioContextRef.current;
        const response = await fetch('https://kvoip.com.br/musicadeespera.mp3');
        const buffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(buffer);

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = true;
        const destination = audioContext.createMediaStreamDestination();
        source.connect(destination);
        source.start();

        // Obtém a trilha de áudio da música de espera
        const holdAudioTrack = destination.stream.getAudioTracks()[0];
        holdAudioTrackRef.current = holdAudioTrack;

        // Substitui a trilha de áudio do microfone pela música de espera
        await replaceAudioTrack(peerConnection, holdAudioTrack);

        setCallState((prev) => ({ ...prev, isOnHold: true }));
      }
    } catch (error) {
      console.error('Error toggling hold:', error);
    }
  };

  const { getIcon } = useIcons();

  const IconPhonePause = getIcon('IconPlayerPause');

  const theme = useTheme();

  return (
    <IconPhonePause
      onClick={() => {
        handleHold();
      }}
      size={theme.icon.size.lg}
      stroke={theme.icon.stroke.sm}
      color={theme.font.color.secondary}
      style={{
        cursor: 'pointer',
        padding: theme.spacing(3),
        borderRadius: '50%',
        border: `1px solid #fff`,
        backgroundColor: isOnHold
          ? theme.background.overlaySecondary
          : theme.background.tertiary,
      }}
    />
  );
};

export default HoldButton;
