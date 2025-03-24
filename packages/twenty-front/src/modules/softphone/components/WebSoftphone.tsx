/* eslint-disable @nx/workspace-no-state-useref */
/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
/* eslint-disable no-console */
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useGetUserSoftfone } from '@/settings/service-center/telephony/hooks/useGetUserSoftfone';
import DTMFButton from '@/softphone/components/DTMFButton';
import Keyboard from '@/softphone/components/Keyboard';
import StatusIndicator from '@/softphone/components/StatusPill';
import { TextInput } from '@/ui/input/components/TextInput';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import React, { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { useRecoilValue } from 'recoil';
import {
  Invitation,
  Inviter,
  Registerer,
  RegistererState,
  Session,
  SessionState,
  UserAgent,
} from 'sip.js';
import {
  SessionDescriptionHandler,
  SessionManager,
} from 'sip.js/lib/platform/web';
import { IconArrowLeft, IconPhone, useIcons } from 'twenty-ui';
import defaultCallState from '../constants/defaultCallState';
import { useRingTone } from '../hooks/useRingTone';
import { CallState } from '../types/callState';
import { CallStatus } from '../types/callStatusEnum';
import { SipConfig } from '../types/sipConfig';
import formatTime from '../utils/formatTime';
import generateAuthorizationHa1 from '../utils/generateAuthorizationHa1';
import HoldButton from './HoldButton';
import TransferButton from './TransferButton';

const StyledContainer = styled.div`
  background-color: ${({ theme }) => theme.background.tertiary};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(3)};
  width: 300px;
  position: relative;
  cursor: grab;
  gap: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

const StyledControlsContainer = styled.div<{ column?: boolean; gap?: number }>`
  align-items: center;
  display: flex;
  flex-direction: ${({ column }) => (column ? 'column' : 'row')};
  gap: ${({ theme, gap }) => theme.spacing(gap || 1)};
`;

const StyledIncomingCall = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledIncomingText = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: normal;
`;

const StyledIncomingNumber = styled.span<{ alignSelf?: string }>`
  align-self: ${({ alignSelf }) => alignSelf || 'start'};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledIncomingButton = styled.div<{ accept: boolean }>`
  color: ${({ theme }) => theme.font.color.inverted};
  font-size: ${({ theme }) => theme.font.size.md};
  width: 100%;
  text-align: center;

  background-color: ${({ accept, theme }) =>
    accept ? theme.color.green60 : theme.color.red};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(2)};
  cursor: pointer;

  &:hover {
    background-color: ${({ accept, theme }) =>
      accept ? theme.color.green70 : theme.color.red50};
  }
`;

const StyledTextAndCallButton = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledDefaultContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
`;

const StyledIncomingButtonContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledIncomingTimerAndIcon = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledStatusAndTimer = styled.div`
  align-items: center;
  justify-content: space-between;
  display: flex;
  width: 100%;
`;

const StyledOngoingCallContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
`;

const StyledEndButton = styled.div`
  color: ${({ theme }) => theme.font.color.inverted};
  font-size: ${({ theme }) => theme.font.size.md};
  width: 100%;
  text-align: center;

  background-color: ${({ theme }) => theme.color.red};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding-block: ${({ theme }) => theme.spacing(2)};

  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.color.red50};
  }
`;

const WebSoftphone: React.FC = () => {
  const [config, setConfig] = useState<SipConfig>();
  const [callState, setCallState] = useState<CallState>(defaultCallState);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00');
  const [ringingTime, setRingingTime] = useState<string>('00:00');
  const [isKeyboardExpanded, setIsKeyboardExpanded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ringingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userAgentRef = useRef<UserAgent | null>(null);
  const registererRef = useRef<Registerer | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const invitationRef = useRef<Invitation | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [isRinging, setIsRinging] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const registerIntervalRef = useRef<number>();
  const holdAudioRef = useRef<HTMLAudioElement>(
    new Audio('https://kvoip.com.br/musicadeespera.mp3'),
  );

  useRingTone(isRinging, isIncomingCall);

  const { getIcon } = useIcons();

  const { t } = useLingui();

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const workspaceMember = workspaceMembers.find(
    (member: WorkspaceMember) => member.id === currentWorkspaceMember?.id,
  );

  // const { telephonyExtensions, loading } = useFindAllPABX();
  const { telephonyExtension } = useGetUserSoftfone({
    extNum: workspaceMember?.extensionNumber || '',
  });

  useEffect(() => {
    if (telephonyExtension) {
      setConfig({
        domain: 'suite.pabx.digital',
        proxy: 'webrtc.dazsoft.com:8080',
        protocol: 'wss://',
        authorizationHa1: '',
        username: telephonyExtension.usuario_autenticacao,
        password: telephonyExtension.senha_sip,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telephonyExtension]);

  useEffect(() => {
    if (config?.username && config?.password && config?.domain) {
      updateConfigWithHa1();
    }
    return () => {
      onComponentUnmount();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.username, config?.password, config?.domain]);

  const startTimer = (
    startTime: number | null,
    setTime: React.Dispatch<React.SetStateAction<string>>,
    timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
  ) => {
    if (startTime) {
      const updateTimer = () => {
        const elapsed = Date.now() - startTime;
        setTime(formatTime(elapsed));
      };
      updateTimer();
      timerRef.current = window.setInterval(
        updateTimer,
        1000,
      ) as unknown as ReturnType<typeof setInterval>;

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    } else {
      setTime('00:00');
    }
  };

  useEffect(
    () => startTimer(callState.callStartTime, setElapsedTime, timerRef),
    [callState.callStartTime],
  );

  useEffect(
    () =>
      startTimer(callState.ringingStartTime, setRingingTime, ringingTimerRef),
    [callState.ringingStartTime],
  );

  useEffect(() => {
    setIsRinging(callState.callStatus === CallStatus.CALLING);
  }, [callState.callStatus]);

  useEffect(() => {
    setIsIncomingCall(callState.incomingCall);
  }, [callState.incomingCall]);

  useEffect(() => {
    if (holdAudioRef.current) {
      holdAudioRef.current.load();
    }
  }, []);

  const updateConfigWithHa1 = async () => {
    const authorizationHa1 = await generateAuthorizationHa1(
      config?.username || '',
      config?.password || '',
      config?.domain || '',
    );
    const updatedConfig = {
      ...config,
      authorizationHa1,
    };
    setConfig(updatedConfig);
    initializeSIP(updatedConfig);
  };

  const cleanupSession = async () => {
    if (sessionRef.current) {
      try {
        if (sessionRef.current.state === SessionState.Established) {
          await sessionRef.current.bye();
        } else if (sessionRef.current.state === SessionState.Establishing) {
          if (sessionRef.current instanceof Inviter)
            await sessionRef.current.cancel();
        }
      } catch (error) {
        console.error('Error cleaning up session:', error);
      }
      sessionRef.current = null;
    }
    if (invitationRef.current) {
      try {
        if (invitationRef.current.state !== SessionState.Terminated) {
          await invitationRef.current.reject();
        }
      } catch (error) {
        console.error('Error rejecting invitation:', error);
      }
      invitationRef.current = null;
    }

    // Clear all timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (ringingTimerRef.current) {
      clearInterval(ringingTimerRef.current);
    }

    // Stop hold music
    if (holdAudioRef.current) {
      holdAudioRef.current.pause();
      holdAudioRef.current.currentTime = 0;
    }

    setCallState((prev) => ({
      ...prev,
      isInCall: false,
      isMuted: false,
      isOnHold: false,
      incomingCall: false,
      incomingCallNumber: '',
      callStatus: CallStatus.NONE,
      callStartTime: null,
      ringingStartTime: null,
    }));

    setDtmf('');
    setIsSendingDTMF(false);

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
  };

  const onComponentUnmount = async () => {
    await cleanupSession();
    if (registererRef.current) {
      registererRef.current.unregister();
    }
    if (userAgentRef.current) {
      userAgentRef.current.stop();
    }
    if (registerIntervalRef.current) {
      clearInterval(registerIntervalRef.current);
    }
  };

  const setupRemoteMedia = (session: Session) => {
    const sessionDescriptionHandler = session.sessionDescriptionHandler as
      | SessionDescriptionHandler
      | undefined;
    if (
      !sessionDescriptionHandler ||
      !('peerConnection' in sessionDescriptionHandler)
    ) {
      console.error('Session description handler not found');
      return;
    }

    const peerConnection = sessionDescriptionHandler.peerConnection;
    if (!peerConnection) {
      console.error('PeerConnection not available');
      return;
    }

    if (remoteAudioRef.current) {
      const remoteStream = new MediaStream();
      peerConnection.getReceivers().forEach((receiver: RTCRtpReceiver) => {
        if (receiver.track) {
          remoteStream.addTrack(receiver.track);
        }
      });
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch((error) => {
        console.error('Error playing remote audio:', error);
      });

      // Verifica se o canal de DTMF está disponível
      const dtmfSender = peerConnection
        .getSenders()
        .find((sender) => sender.track?.kind === 'audio')?.dtmf;
      if (!dtmfSender) {
        console.error('DTMF sender not available');
      }
    }
  };

  const initializeSIP = async (updatedConfig: SipConfig | undefined) => {
    if (!updatedConfig) return;

    try {
      if (
        !updatedConfig.username ||
        !updatedConfig.password ||
        !updatedConfig.domain
      ) {
        throw new Error('Missing required configuration');
      }

      console.log('Initializing SIP connection...', { updatedConfig });
      setCallState((prev) => ({ ...prev, isRegistering: true }));

      const uri = UserAgent.makeURI(
        `sip:${updatedConfig.username}@${updatedConfig.domain}`,
      );
      if (!uri) {
        throw new Error('Failed to create URI');
      }

      const wsServer = `${updatedConfig.protocol}${updatedConfig.proxy}`;

      const userAgent = new UserAgent({
        uri,
        userAgentString: 'RamalWeb/1.1.11', // Define o UserAgent
        transportOptions: {
          server: wsServer,
          traceSip: true,
          wsServers: [wsServer],
        },
        authorizationUsername: updatedConfig.username,
        authorizationPassword: updatedConfig.password,
        displayName: updatedConfig.username,
        contactName: updatedConfig.username,
        noAnswerTimeout: 60,
        hackIpInContact: false,
        logLevel: 'error',
        logConnector: console.log,
        sessionDescriptionHandlerFactoryOptions: {
          constraints: {
            audio: true,
            video: false,
          },
          peerConnectionOptions: {
            rtcConfiguration: {
              iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
            },
          },
          modifiers: [
            (description: RTCSessionDescriptionInit) => {
              description.sdp = description.sdp?.replace(
                'a=rtpmap:101 telephone-event/8000',
                'a=rtpmap:101 telephone-event/8000\r\na=fmtp:101 0-15',
              );
              return Promise.resolve(description);
            },
          ],
        },
      });

      // Manter o UserAgent na referência
      userAgentRef.current = userAgent;

      // // Enviar pacotes OPTIONS a cada 30 segundos
      // setInterval(() => {
      //   // const optionsRequest = new Request('OPTIONS', {
      //   //   to: uri,
      //   //   from: uri,
      //   //   headers: {
      //   //     to: { uri: uri },
      //   //     from: { uri: uri },
      //   //     'max-forwards': 70,
      //   //   },
      //   // }); ISSO NAO FAZ SENTIDO MAS TA FUNCIONANDO.
      //   try {
      //     userAgent.transport.send('aa');
      //   } catch (err) {
      //     console.error('Error sending OPTIONS packet:', err);
      //   }
      //   console.log('Pacote OPTIONS enviado para manter a conexão ativa.');
      // }, 30000); // Intervalo de 30 segundos

      // Evento para encerrar a conexão quando a página for fechada ou recarregada
      window.addEventListener('beforeunload', () => {
        if (userAgentRef.current) {
          userAgentRef.current.stop(); // Encerra a conexão SIP
          console.log('Conexão SIP encerrada.');
        }
      });

      userAgent.delegate = {
        onInvite: (invitation) => {
          console.log('Incoming call received');

          // Don't clean up the session for incoming calls - this prevents race conditions
          // We'll only clean up if there's already an active call
          if (sessionRef.current || invitationRef.current) {
            cleanupSession();
          }

          invitationRef.current = invitation;
          const fromNumber = invitation.remoteIdentity.uri.user;
          setCallState((prev) => ({
            ...prev,
            incomingCall: true,
            incomingCallNumber: fromNumber || '',
            ringingStartTime: Date.now(),
            callStatus: CallStatus.INCOMING_CALL,
          }));

          invitation.stateChange.addListener((state: SessionState) => {
            console.log('Incoming call state changed:', state);
            if (state === SessionState.Establishing) {
              setCallState((prev) => ({
                ...prev,
                callStatus: CallStatus.CONNECTING,
              }));
            } else if (state === SessionState.Established) {
              sessionRef.current = invitation;
              setupRemoteMedia(invitation);
              setCallState((prev) => ({
                ...prev,
                isInCall: true,
                incomingCall: false,
                incomingCallNumber: '',
                callStatus: CallStatus.CONNECTED,
                callStartTime: Date.now(),
                ringingStartTime: null,
              }));
              console.log('Incoming call accepted:', invitationRef.current);
            } else if (state === SessionState.Terminated) {
              console.log('Call terminated with reason:');
              cleanupSession();
            }
          });
        },
      };

      userAgent.transport.onConnect = async () => {
        console.log('Transport connected');
        try {
          const registerer = new Registerer(userAgent, {
            expires: 10, //tempo de registro
            extraHeaders: ['X-oauth-dazsoft: 1'],
            regId: 1,
          });

          registererRef.current = registerer;

          registerer.stateChange.addListener((newState: RegistererState) => {
            console.log('Registerer state changed:', newState);
            switch (newState) {
              case RegistererState.Registered:
                setCallState((prev) => ({
                  ...prev,
                  isRegistered: true,
                  isRegistering: false,
                }));
                requestMediaPermissions();
                break;
              case RegistererState.Unregistered:
              case RegistererState.Terminated:
                setCallState((prev) => ({
                  ...prev,
                  isRegistered: false,
                  isRegistering: false,
                }));
                cleanupSession();
                break;
            }
          });

          await registerer.register();
          console.log('Registration request sent');

          // Set interval to renew registration
          registerIntervalRef.current = window.setInterval(() => {
            if (registererRef.current) {
              registererRef.current.register().catch((error) => {
                console.error('Error renewing registration:', error);
              });
            }
          }, 270000); // Renew registration every 4.5 minutes (270000 ms) // it was 20000
        } catch (error) {
          console.error('Registration error:', error);
          setCallState((prev) => ({
            ...prev,
            isRegistered: false,
            isRegistering: false,
          }));
        }
      };

      userAgent.transport.onDisconnect = (error?: Error) => {
        console.log('Transport disconnected', error);
        setCallState((prev) => ({
          ...prev,
          isRegistered: false,
          isRegistering: false,
        }));
        cleanupSession();
      };

      await userAgent.start();
      console.log('UserAgent started');
    } catch (error) {
      console.error('SIP initialization error:', error);
      setCallState((prev) => ({
        ...prev,
        isRegistered: false,
        isRegistering: false,
      }));
    }
  };

  const sendDTMF = (tone: string) => {
    if (
      !sessionRef.current ||
      sessionRef.current.state !== SessionState.Established
    ) {
      console.error('Cannot send DTMF: No active call session');
      return;
    }

    try {
      console.log(`Sending DTMF tone: ${tone}`);

      const options = {
        requestOptions: {
          body: {
            contentDisposition: 'render',
            contentType: 'application/dtmf-relay',
            content: `Signal=${tone}\r\nDuration=1000`,
          },
        },
      };

      sessionRef.current.info(options);
      console.log(`DTMF tone ${tone} sent successfully`);
    } catch (error) {
      console.error('Error sending DTMF tone:', error);
    }
  };

  const requestMediaPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Media permissions granted');
    } catch (error) {
      console.error('Media permissions error:', error);
    }
  };

  const handleCall = async () => {
    if (!callState.currentNumber || !userAgentRef.current || callState.isInCall)
      return;

    setIsKeyboardExpanded(false);

    try {
      await cleanupSession();
      setCallState((prev) => ({
        ...prev,
        callStatus: CallStatus.STARTING_CALL,
        ringingStartTime: Date.now(),
      }));

      const target = UserAgent.makeURI(
        `sip:${callState.currentNumber}@${config?.domain}`,
      );
      if (!target) {
        throw new Error('Failed to create target URI');
      }

      const inviter = new Inviter(userAgentRef.current, target, {
        extraHeaders: ['X-oauth-dazsoft: 1'],
        sessionDescriptionHandlerOptions: {
          constraints: {
            audio: true,
            video: false,
          },
        },
      });

      sessionRef.current = inviter;

      console.log('Inviting:', inviter);

      inviter.stateChange.addListener(async (state: SessionState) => {
        console.log('Call state changed:', state);
        if (state === SessionState.Establishing) {
          setCallState((prev) => ({
            ...prev,
            callStatus: CallStatus.CALLING,
            ringingStartTime: prev.ringingStartTime || Date.now(),
          }));
        } else if (state === SessionState.Established) {
          sessionRef.current = inviter;
          setupRemoteMedia(inviter);
          setCallState((prev) => ({
            ...prev,
            isInCall: true,
            callStatus: CallStatus.CONNECTED,
            callStartTime: Date.now(),
            ringingStartTime: null,
          }));
          console.log('Active call established:', inviter);
        } else if (state === SessionState.Terminated) {
          await cleanupSession();
        }
      });

      await inviter.invite();
    } catch (error) {
      console.error('Call error:', error);
      await cleanupSession();
    }
  };

  const handleAcceptCall = async () => {
    if (!invitationRef.current) {
      console.log('entrou aqui');
      return;
    }

    try {
      setCallState((prev) => ({
        ...prev,
        callStatus: CallStatus.ACCEPTING_CALL,
        ringingStartTime: null,
        callStartTime: Date.now(),
      }));

      await invitationRef.current.accept({
        sessionDescriptionHandlerOptions: {
          constraints: {
            audio: true,
            video: false,
          },
        },
      });

      setupRemoteMedia(invitationRef.current);
      console.log('Incoming call accepted:', invitationRef.current);
    } catch (error) {
      console.error('Error accepting call:', error);
      await cleanupSession();
    }
  };

  const handleRejectCall = async () => {
    if (!invitationRef.current) return;

    try {
      invitationRef.current.reject();
    } catch (error) {
      console.error('Error rejecting call:', error);
    } finally {
      await cleanupSession();
    }
  };

  const handleMute = () => {
    if (sessionRef.current?.state === SessionState.Established) {
      try {
        const audioTrack = (
          sessionRef.current.sessionDescriptionHandler as
            | SessionDescriptionHandler
            | undefined
        )?.peerConnection
          ?.getSenders()
          .find((sender) => sender.track?.kind === 'audio');

        if (audioTrack?.track) {
          audioTrack.track.enabled = callState.isMuted;
          setCallState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
        }
      } catch (error) {
        console.error('Error toggling mute:', error);
      }
    }
  };

  const transferCall = (to: string) => {
    const sessionManager = new SessionManager(
      'wss://webrtc.dazsoft.com:8080/ws',
      { registererOptions: { extraHeaders: ['X-oauth-dazsoft: 1'] } },
    );

    if (sessionRef.current)
      sessionManager?.transfer(
        sessionRef.current,
        `sip:${to}@suite.pabx.digital`,
      );
  };

  const handleKeyboardClick = (key: string) => {
    setCallState((prev) => ({
      ...prev,
      currentNumber: prev.currentNumber + key,
    }));
  };

  const KeyboardOffIcon = getIcon('IconKeyboardOff');
  const KeyboardIcon = getIcon('IconKeyboard');
  const PhoneIncoming = getIcon('IconPhoneIncoming');
  const IconPhoneOutgoing = getIcon('IconPhoneOutgoing');
  const IconMicrophoneOff = getIcon('IconMicrophoneOff');

  const [isSendingDTMF, setIsSendingDTMF] = useState(false);
  const [dtmf, setDtmf] = useState('');

  const theme = useTheme();

  const handleSendDtmf = (key: string) => {
    if (sessionRef.current?.state === SessionState.Established) {
      const keyTrimmedLastChar = key.trim()[key.length - 1];

      console.log('Sending DTMF tone from app:', keyTrimmedLastChar);
      setDtmf(dtmf + keyTrimmedLastChar);
      sendDTMF(keyTrimmedLastChar);
    }
  };

  return (
    <Draggable
      enableUserSelectHack={true}
      onStart={(e) => {
        // Prevent the dragSelect from triggering
        e.stopPropagation();
      }}
    >
      <StyledContainer
        data-select-disable="true"
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onMouseMove={(e) => {
          e.stopPropagation();
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
        }}
        style={{ zIndex: 9999 }}
      >
        <audio ref={remoteAudioRef} autoPlay />

        {callState.incomingCall && !callState.isInCall ? (
          <StyledIncomingCall>
            <PhoneIncoming
              color={theme.font.color.secondary}
              size={theme.icon.size.md}
            />
            <StyledIncomingText>{t`incoming`}</StyledIncomingText>
          </StyledIncomingCall>
        ) : (
          <StyledStatusAndTimer>
            <StatusIndicator
              status={
                callState.isRegistered
                  ? 'online'
                  : callState.isRegistering
                    ? 'registering'
                    : 'offline'
              }
              extension={config?.username}
            />
            {(callState.isInCall || callState.ringingStartTime) && (
              <StyledIncomingTimerAndIcon>
                <IconPhoneOutgoing
                  color={theme.font.color.secondary}
                  size={theme.icon.size.md}
                />
                <StyledIncomingText>
                  {callState.callStartTime ? elapsedTime : ringingTime}
                </StyledIncomingText>
              </StyledIncomingTimerAndIcon>
            )}
          </StyledStatusAndTimer>
        )}

        <StyledControlsContainer
          column={callState.incomingCall && !callState.isInCall}
        >
          {callState.incomingCall && !callState.isInCall ? (
            <>
              <StyledIncomingNumber>
                {callState.incomingCallNumber}
              </StyledIncomingNumber>
              <StyledIncomingButtonContainer>
                <StyledIncomingButton accept={false} onClick={handleRejectCall}>
                  {t`Reject`}
                </StyledIncomingButton>
                <StyledIncomingButton accept={true} onClick={handleAcceptCall}>
                  {t`Accept`}
                </StyledIncomingButton>
              </StyledIncomingButtonContainer>
            </>
          ) : (
            <div style={{ width: '100%' }}>
              <StyledDefaultContainer>
                <StyledTextAndCallButton>
                  {!callState.isInCall && !callState.callStatus && (
                    <TextInput
                      placeholder={t`Dial the phone number`}
                      fullWidth
                      value={callState.currentNumber}
                      onChange={(e) => {
                        if (!callState.isInCall) {
                          setCallState((prev) => ({
                            ...prev,
                            currentNumber: e.replace(/\D/g, ''),
                          }));
                        }
                      }}
                      RightIcon={() =>
                        isKeyboardExpanded ? (
                          <KeyboardOffIcon
                            color={theme.font.color.tertiary}
                            size={theme.icon.size.md}
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              setIsKeyboardExpanded(!isKeyboardExpanded)
                            }
                          />
                        ) : (
                          <KeyboardIcon
                            color={theme.font.color.tertiary}
                            size={theme.icon.size.md}
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              setIsKeyboardExpanded(!isKeyboardExpanded)
                            }
                          />
                        )
                      }
                      disabled={callState.isInCall}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && callState.isRegistered) {
                          handleCall();
                        }
                      }}
                    />
                  )}

                  {callState.isRegistered &&
                    !callState.isInCall &&
                    !callState.callStatus &&
                    !isKeyboardExpanded && (
                      <IconPhone
                        onClick={handleCall}
                        size={theme.icon.size.lg}
                        stroke={theme.icon.stroke.sm}
                        color={theme.color.gray30}
                        style={{
                          cursor: 'pointer',
                          padding: theme.spacing(1),
                          borderRadius: '50%',
                          backgroundColor: theme.color.green60,
                        }}
                      />
                    )}

                  {isSendingDTMF && (
                    <TextInput
                      placeholder={t`Dial the phone number`}
                      fullWidth
                      value={dtmf}
                      onChange={(e) => {
                        handleSendDtmf(e);
                      }}
                      RightIcon={() =>
                        isKeyboardExpanded ? (
                          <KeyboardOffIcon
                            color={theme.font.color.tertiary}
                            size={theme.icon.size.md}
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              setIsKeyboardExpanded(!isKeyboardExpanded)
                            }
                          />
                        ) : (
                          <KeyboardIcon
                            color={theme.font.color.tertiary}
                            size={theme.icon.size.md}
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              setIsKeyboardExpanded(!isKeyboardExpanded)
                            }
                          />
                        )
                      }
                    />
                  )}

                  {isSendingDTMF && !isKeyboardExpanded && (
                    <IconArrowLeft
                      onClick={() => {
                        setIsSendingDTMF(false);
                        setIsKeyboardExpanded(false);
                      }}
                      size={theme.icon.size.lg}
                      stroke={theme.icon.stroke.sm}
                      color={theme.color.gray30}
                      style={{
                        cursor: 'pointer',
                        padding: theme.spacing(1),
                        borderRadius: '50%',
                        backgroundColor: theme.color.red60,
                      }}
                    />
                  )}
                </StyledTextAndCallButton>

                {isKeyboardExpanded && (
                  <Keyboard
                    onClick={
                      !isSendingDTMF ? handleKeyboardClick : handleSendDtmf
                    }
                  />
                )}

                {callState.isRegistered &&
                  !callState.isInCall &&
                  !callState.callStatus &&
                  isKeyboardExpanded && (
                    <IconPhone
                      onClick={handleCall}
                      size={theme.icon.size.lg}
                      stroke={theme.icon.stroke.sm}
                      color={theme.color.gray30}
                      style={{
                        cursor: 'pointer',
                        padding: theme.spacing(5),
                        borderRadius: '50%',
                        backgroundColor: theme.color.green60,
                      }}
                    />
                  )}

                {isSendingDTMF && isKeyboardExpanded && (
                  <IconArrowLeft
                    onClick={() => {
                      setIsSendingDTMF(false);
                      setIsKeyboardExpanded(false);
                    }}
                    size={theme.icon.size.lg}
                    stroke={theme.icon.stroke.sm}
                    color={theme.color.gray30}
                    style={{
                      cursor: 'pointer',
                      padding: theme.spacing(5),
                      borderRadius: '50%',
                      backgroundColor: theme.color.red60,
                    }}
                  />
                )}
              </StyledDefaultContainer>

              {/* callState.isInCall */}
              {callState.isInCall && !isSendingDTMF && (
                <StyledOngoingCallContainer>
                  <StyledIncomingNumber alignSelf="center">
                    {callState.currentNumber}
                  </StyledIncomingNumber>

                  <StyledControlsContainer column={false} gap={5}>
                    <HoldButton
                      session={sessionRef.current}
                      isOnHold={callState.isOnHold}
                      setCallState={setCallState}
                      callState={callState}
                    />

                    <IconMicrophoneOff
                      onClick={handleMute}
                      size={theme.icon.size.lg}
                      stroke={theme.icon.stroke.sm}
                      color={theme.font.color.secondary}
                      style={{
                        cursor: 'pointer',
                        padding: theme.spacing(3),
                        borderRadius: '50%',
                        // eslint-disable-next-line @nx/workspace-no-hardcoded-colors
                        border: `1px solid #fff`,
                        backgroundColor: callState.isMuted
                          ? theme.background.overlaySecondary
                          : theme.background.tertiary,
                      }}
                    />

                    <TransferButton
                      session={sessionRef.current}
                      type="attended"
                      sendDTMF={transferCall}
                    />

                    <DTMFButton setIsSendingDTMF={setIsSendingDTMF} />
                  </StyledControlsContainer>

                  <StyledEndButton onClick={cleanupSession}>
                    {t`End call`}
                  </StyledEndButton>
                </StyledOngoingCallContainer>
              )}

              {(callState.callStatus === CallStatus.CALLING ||
                callState.callStatus === CallStatus.STARTING_CALL) && (
                <StyledEndButton onClick={cleanupSession}>
                  {t`End call`}
                </StyledEndButton>
              )}
            </div>
          )}
        </StyledControlsContainer>
      </StyledContainer>
    </Draggable>
  );
};

export default WebSoftphone;

// const setupUserAgent = (updatedConfig: SipConfig, uri: URI) => {
//   const wsServer = `${updatedConfig.protocol}${updatedConfig.proxy}`;

//   return new UserAgent({
//     uri,
//     userAgentString: 'RamalWeb/1.1.11', // Define o UserAgent
//     transportOptions: {
//       server: wsServer,
//       traceSip: true,
//       wsServers: [wsServer],
//     },
//     sipExtensionReplaces: 'Supported' as SIPExtension,
//     sipExtensionExtraSupported: ['path', 'gruu', '100rel'],
//     authorizationUsername: updatedConfig.username,
//     authorizationPassword: updatedConfig.password,
//     displayName: updatedConfig.username,
//     contactName: updatedConfig.username,
//     noAnswerTimeout: 60,
//     hackIpInContact: false,
//     logLevel: 'error',
//     logConnector: console.log,
//     sessionDescriptionHandlerFactoryOptions: {
//       constraints: {
//         audio: true,
//         video: false,
//       },
//       peerConnectionOptions: {
//         rtcConfiguration: {
//           iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
//         },
//       },
//       modifiers: [
//         (description: RTCSessionDescriptionInit) => {
//           description.sdp = description.sdp?.replace(
//             'a=rtpmap:101 telephone-event/8000',
//             'a=rtpmap:101 telephone-event/8000\r\na=fmtp:101 0-15',
//           );
//           return Promise.resolve(description);
//         },
//       ],
//     },
//   });
// };

// const keepConectionAlive = async (userAgent: UserAgent, uri: URI) => {
//   // Enviar pacotes OPTIONS a cada 30 segundos
//   setInterval(async () => {
//     if (!userAgent || !userAgent.transport) {
//       console.error('Erro: UserAgent ou transporte não está disponível.');
//       return;
//     }

//     try {
//       const optionsMessage = `OPTIONS sip:${uri} SIP/2.0
//       Via: SIP/2.0/WSS example.com;branch=z9hG4bK776asdhds
//       Max-Forwards: 70
//       To: <sip:${uri}>
//       From: <sip:${uri}>;tag=12345
//       Call-ID: ${Math.random().toString(36).slice(2, 12)}
//       CSeq: 1 OPTIONS
//       Content-Length: 0`;

//       await userAgent.transport.send(optionsMessage);
//       console.log('Pacote OPTIONS enviado para manter a conexão ativa.');
//     } catch (error) {
//       console.error('Erro ao enviar pacote OPTIONS:', error);
//     }
//   }, 30000); // A cada 30 segundos
// };

// const onInvite = async (invitation: Invitation) => {
//   console.log('Incoming call received');

//   await cleanupSession();

//   invitationRef.current = invitation;
//   const fromNumber = invitation.remoteIdentity.uri.user;
//   setCallState((prev) => ({
//     ...prev,
//     incomingCall: true,
//     incomingCallNumber: fromNumber || '',
//     ringingStartTime: Date.now(),
//     callStatus: CallStatus.INCOMING_CALL,
//   }));

//   invitation.stateChange.addListener(async (state: SessionState) => {
//     console.log('Incoming call state changed:', state);
//     if (state === SessionState.Establishing) {
//       setCallState((prev) => ({
//         ...prev,
//         callStatus: CallStatus.CONNECTING,
//       }));
//     } else if (state === SessionState.Established) {
//       sessionRef.current = invitation;
//       setupRemoteMedia(invitation);
//       setCallState((prev) => ({
//         ...prev,
//         isInCall: true,
//         incomingCall: false,
//         incomingCallNumber: '',
//         callStatus: CallStatus.CONNECTED,
//         callStartTime: Date.now(),
//         ringingStartTime: null,
//       }));
//       console.log('Incoming call accepted:', invitationRef.current);
//     } else if (state === SessionState.Terminated) {
//       await cleanupSession();
//     }
//   });
// };

// const onConnect = async (userAgent: UserAgent) => {
//   console.log('Transport connected');
//   try {
//     const registerer = new Registerer(userAgent, {
//       expires: 300, //tempo de registro
//       extraHeaders: ['X-oauth-dazsoft: 1'],
//       regId: 1,
//     });

//     registererRef.current = registerer;

//     registerer.stateChange.addListener(async (newState: RegistererState) => {
//       console.log('Registerer state changed:', newState);
//       switch (newState) {
//         case RegistererState.Registered:
//           setCallState((prev) => ({
//             ...prev,
//             isRegistered: true,
//             isRegistering: false,
//           }));
//           requestMediaPermissions();
//           break;
//         case RegistererState.Unregistered:
//         case RegistererState.Terminated:
//           setCallState((prev) => ({
//             ...prev,
//             isRegistered: false,
//             isRegistering: false,
//           }));
//           await cleanupSession();
//           break;
//       }
//     });

//     await registerer.register();
//     console.log('Registration request sent');

//     // Set interval to renew registration
//     registerIntervalRef.current = window.setInterval(() => {
//       if (registererRef.current) {
//         registererRef.current.register().catch((error) => {
//           console.error('Error renewing registration:', error);
//         });
//       }
//     }, 270000); // Renew registration every 4.5 minutes (270000 ms)
//   } catch (error) {
//     console.error('Registration error:', error);
//     setCallState((prev) => ({
//       ...prev,
//       isRegistered: false,
//       isRegistering: false,
//     }));
//   }
// };

// const onDisconnect = async (error?: Error) => {
//   console.log('Transport disconnected', error);
//   setCallState((prev) => ({
//     ...prev,
//     isRegistered: false,
//     isRegistering: false,
//   }));
//   await cleanupSession();
// };

// const sendDTMF = (tone: string) => {
//   console.log('Sending DTMF tone:', tone);
//   console.log(
//     'Comparacao',
//     sessionRef.current?.state,
//     ' x ',
//     SessionState.Established,
//   );
//   // sessionManager?.transfer(session, `sip:${transferTarget}@${domain}`);
//   console.log('Session ref', sessionRef.current);

//   if (sessionRef.current?.state === SessionState.Established) {
//     const dtmfSender = (
//       sessionRef.current.sessionDescriptionHandler as
//         | SessionDescriptionHandler
//         | undefined
//     )?.peerConnection
//       ?.getSenders()
//       .find((sender) => sender.track?.kind === 'audio')?.dtmf;

//     console.log('DtmfSender:', dtmfSender);
//     console.log(
//       'SessionDescriptionHandler:',
//       (
//         sessionRef.current.sessionDescriptionHandler as
//           | SessionDescriptionHandler
//           | undefined
//       )?.peerConnection?.getSenders(),
//     );

//     if (dtmfSender) {
//       console.log(`Sending DTMF: ${tone}`);
//       dtmfSender.insertDTMF(tone, 1000);
//     } else {
//       console.error('DTMF sender not available');
//     }
//   }
// };
