declare module 'onesignal' {
  interface OneSignalInitOptions {
    appId: string;
    safari_web_id?: string;
    notifyButton?: {
      enable: boolean;
    };
  }

  interface OneSignal {
    init(options: OneSignalInitOptions): Promise<void>;
  }

  const OneSignal: OneSignal;
  export default OneSignal;
}
