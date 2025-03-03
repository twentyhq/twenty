/* eslint-disable @nx/workspace-no-state-useref */
/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
/* eslint-disable no-console */
import {
  Circle,
  Mic,
  MicOff,
  Phone,
  PhoneIncoming,
  PhoneOff,
  RefreshCcw,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import {
  Invitation,
  Inviter,
  Registerer,
  RegistererState,
  Session,
  SessionState,
  SIPExtension,
  URI,
  UserAgent,
} from 'sip.js';
import {
  SessionDescriptionHandler,
  SessionManager,
} from 'sip.js/lib/platform/web';
import defaultCallState from '../constants/defaultCallState';
import defaultConfig from '../constants/defaultConfig';
import { useRingTone } from '../hooks/useRingTone';
import { CallState } from '../types/callState';
import { CallStatus } from '../types/callStatusEnum';
import { SipConfig } from '../types/sipConfig';
import formatTime from '../utils/formatTime';
import generateAuthorizationHa1 from '../utils/generateAuthorizationHa1';
import HoldButton from './HoldButton';
import TransferButton from './TransferButton';

const WebSoftphone: React.FC = () => {
  const [config, setConfig] = useState<SipConfig>(defaultConfig);
  const [callState, setCallState] = useState<CallState>(defaultCallState);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00');
  const [ringingTime, setRingingTime] = useState<string>('00:00');
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

  useEffect(() => {
    if (config.username && config.password && config.domain) {
      updateConfigWithHa1();
    }
    return () => {
      onComponentUnmount();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.username, config.password, config.domain]);

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
      config.username,
      config.password,
      config.domain,
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

  const setupUserAgent = (updatedConfig: SipConfig, uri: URI) => {
    const wsServer = `${updatedConfig.protocol}${updatedConfig.proxy}`;

    return new UserAgent({
      uri,
      userAgentString: 'RamalWeb/1.1.11', // Define o UserAgent
      transportOptions: {
        server: wsServer,
        traceSip: true,
        wsServers: [wsServer],
      },
      sipExtensionReplaces: 'Supported' as SIPExtension,
      sipExtensionExtraSupported: ['path', 'gruu', '100rel'],
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
  };

  const keepConectionAlive = async (userAgent: UserAgent, uri: URI) => {
    // Enviar pacotes OPTIONS a cada 30 segundos
    setInterval(async () => {
      if (!userAgent || !userAgent.transport) {
        console.error('Erro: UserAgent ou transporte não está disponível.');
        return;
      }

      const optionsMessage = `OPTIONS sip:${uri} SIP/2.0
      Via: SIP/2.0/WSS example.com;branch=z9hG4bK776asdhds
      Max-Forwards: 70
      To: <sip:${uri}>
      From: <sip:${uri}>;tag=12345
      Call-ID: ${Math.random().toString(36).slice(2, 12)}
      CSeq: 1 OPTIONS
      Content-Length: 0`;

      await userAgent.transport.send(optionsMessage);
      console.log('Pacote OPTIONS enviado para manter a conexão ativa.');
    }, 30000); // A cada 30 segundos
  };

  const onInvite = async (invitation: Invitation) => {
    console.log('Incoming call received');

    await cleanupSession();

    invitationRef.current = invitation;
    const fromNumber = invitation.remoteIdentity.uri.user;
    setCallState((prev) => ({
      ...prev,
      incomingCall: true,
      incomingCallNumber: fromNumber || '',
      ringingStartTime: Date.now(),
      callStatus: CallStatus.INCOMING_CALL,
    }));

    invitation.stateChange.addListener(async (state: SessionState) => {
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
        await cleanupSession();
      }
    });
  };

  const onConnect = async (userAgent: UserAgent) => {
    console.log('Transport connected');
    try {
      const registerer = new Registerer(userAgent, {
        expires: 300, //tempo de registro
        extraHeaders: ['X-oauth-dazsoft: 1'],
        regId: 1,
      });

      registererRef.current = registerer;

      registerer.stateChange.addListener(async (newState: RegistererState) => {
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
            await cleanupSession();
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
      }, 270000); // Renew registration every 4.5 minutes (270000 ms)
    } catch (error) {
      console.error('Registration error:', error);
      setCallState((prev) => ({
        ...prev,
        isRegistered: false,
        isRegistering: false,
      }));
    }
  };

  const onDisconnect = async (error?: Error) => {
    console.log('Transport disconnected', error);
    setCallState((prev) => ({
      ...prev,
      isRegistered: false,
      isRegistering: false,
    }));
    await cleanupSession();
  };

  const initializeSIP = async (updatedConfig: SipConfig) => {
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

      const userAgent = setupUserAgent(updatedConfig, uri);

      // Manter o UserAgent na referência
      userAgentRef.current = userAgent;

      userAgent.delegate = { onInvite: onInvite };

      userAgent.transport.onConnect = () => onConnect(userAgent);

      userAgent.transport.onDisconnect = onDisconnect;

      // keepConectionAlive(userAgent, uri);

      // Evento para encerrar a conexão quando a página for fechada ou recarregada
      window.addEventListener('beforeunload', onComponentUnmount);

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

    try {
      await cleanupSession();
      setCallState((prev) => ({
        ...prev,
        callStatus: CallStatus.STARTING_CALL,
        ringingStartTime: Date.now(),
      }));

      const target = UserAgent.makeURI(
        `sip:${callState.currentNumber}@${config.domain}`,
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
    if (!invitationRef.current) return;

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

  const sendDTMF = (tone: string) => {
    const sessionManager = new SessionManager(
      'wss://webrtc.dazsoft.com:8080/ws',
      { registererOptions: { extraHeaders: ['X-oauth-dazsoft: 1'] } },
    );

    if (sessionRef.current)
      sessionManager?.transfer(
        sessionRef.current,
        `sip:${tone}@suite.pabx.digital`,
      );
  };

  // const sendDTMF1 = (tone: string) => {
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

  return (
    <Draggable>
      <div className="bg-white rounded-lg shadow-lg p-2 flex items-center gap-2 w-full max-w-full h-auto">
        <audio ref={remoteAudioRef} autoPlay />

        {/* Barra de status */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Circle
              className={`w-3 h-3 ${
                callState.isRegistered
                  ? 'text-green-500'
                  : callState.isRegistering
                    ? 'text-yellow-500'
                    : 'text-red-500'
              }`}
            />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
              {callState.isRegistered
                ? 'Online'
                : callState.isRegistering
                  ? 'Registrando'
                  : 'Offline'}
            </div>
          </div>
          {callState.callStatus && (
            <span className="text-xs text-gray-600 truncate">
              {callState.callStatus}
            </span>
          )}
        </div>

        {/* Área principal */}
        <div className="flex items-center gap-2 flex-1">
          {callState.incomingCall && !callState.isInCall ? (
            <>
              <div className="flex-1 flex items-center gap-1 min-w-0">
                <PhoneIncoming className="w-4 h-4 text-blue-600 animate-pulse flex-shrink-0" />
                <span className="text-xs truncate">
                  Chamada de: <strong>{callState.incomingCallNumber}</strong>
                </span>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={handleAcceptCall}
                  className="p-1 rounded-full bg-green-100 hover:bg-green-200 text-green-600"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRejectCall}
                  className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600"
                >
                  <PhoneOff className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              {!callState.isInCall && !callState.callStatus ? (
                <input
                  type="text"
                  placeholder="Digite o número com o código do país e DDD"
                  value={callState.currentNumber}
                  onChange={(e) => {
                    if (!callState.isInCall) {
                      const numericValue = e.target.value.replace(/\D/g, '');
                      setCallState((prev) => ({
                        ...prev,
                        currentNumber: numericValue,
                      }));
                    }
                  }}
                  disabled={callState.isInCall}
                  className="flex-1 min-w-0 px-2 py-1 text-xs border rounded-md focus:ring-1"
                  onKeyDown={(e) => {
                    if (
                      e.key === 'Enter' &&
                      typeof window !== 'undefined' &&
                      callState.isRegistered
                    ) {
                      handleCall();
                    }
                  }}
                />
              ) : (
                <span className="text-xs font-mono">
                  {callState.callStartTime ? elapsedTime : ringingTime}
                </span>
              )}

              <div className="flex gap-1 flex-shrink-0">
                {callState.isRegistered &&
                  !callState.isInCall &&
                  !callState.callStatus && (
                    <button
                      onClick={handleCall}
                      className="p-1 rounded-full hover:bg-blue-50 text-blue-600"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  )}

                {callState.isInCall && (
                  <>
                    <button
                      onClick={handleMute}
                      className={`p-1 rounded-full hover:bg-blue-50 ${
                        callState.isMuted ? 'text-red-600' : 'text-blue-600'
                      }`}
                    >
                      {callState.isMuted ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </button>
                    <HoldButton
                      session={sessionRef.current}
                      isOnHold={callState.isOnHold}
                      setCallState={setCallState}
                      callState={callState}
                    />
                    <TransferButton
                      session={sessionRef.current}
                      type="attended"
                      sendDTMF={sendDTMF}
                    />
                    <button
                      onClick={cleanupSession}
                      className="p-1 rounded-full hover:bg-red-50 text-red-600"
                    >
                      <PhoneOff className="w-4 h-4" />
                    </button>
                  </>
                )}

                {(callState.callStatus === CallStatus.CALLING ||
                  callState.callStatus === CallStatus.STARTING_CALL) && (
                  <button
                    onClick={cleanupSession}
                    className="p-1 rounded-full hover:bg-red-50 text-red-600"
                  >
                    <PhoneOff className="w-4 h-4" />
                  </button>
                )}
                {!callState.isRegistered && (
                  <button
                    onClick={() => initializeSIP(config)}
                    className="p-1 rounded-full hover:bg-blue-50 text-blue-600"
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Draggable>
  );
};

export default WebSoftphone;
