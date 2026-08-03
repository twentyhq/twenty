import { CommandShutdownService } from 'src/database/commands/command-runners/command-shutdown.service';

describe('CommandShutdownService', () => {
  let service: CommandShutdownService;
  let exitSpy: jest.SpyInstance;
  let signalListeners: Map<string, () => void>;
  const initialExitCode = process.exitCode;

  beforeEach(() => {
    service = new CommandShutdownService();
    signalListeners = new Map();

    exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {
      // oxlint-disable-next-line typescript/no-explicit-any
    }) as any);

    jest
      .spyOn(process, 'on')
      .mockImplementation((event: string | symbol, listener) => {
        signalListeners.set(String(event), listener as () => void);

        return process;
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.exitCode = initialExitCode;
  });

  it('should not install listeners until it is asked to listen', () => {
    expect(process.on).not.toHaveBeenCalled();

    service.listenToShutdownSignals();

    expect(process.on).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    expect(process.on).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
  });

  it('should install listeners only once', () => {
    service.listenToShutdownSignals();
    service.listenToShutdownSignals();

    const registrationsBySignal = (process.on as jest.Mock).mock.calls.reduce<
      Record<string, number>
    >((accumulator, [event]) => {
      accumulator[String(event)] = (accumulator[String(event)] ?? 0) + 1;

      return accumulator;
    }, {});

    expect(registrationsBySignal).toEqual({ SIGINT: 1, SIGTERM: 1 });
  });

  it('should not report a shutdown before any signal is received', () => {
    service.listenToShutdownSignals();

    expect(service.isShutdownRequested()).toBe(false);
  });

  it('should request a graceful shutdown on the first SIGINT', () => {
    service.listenToShutdownSignals();

    signalListeners.get('SIGINT')?.();

    expect(service.isShutdownRequested()).toBe(true);
    expect(process.exitCode).toBe(130);
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('should force an immediate exit on the second SIGINT', () => {
    service.listenToShutdownSignals();

    signalListeners.get('SIGINT')?.();
    signalListeners.get('SIGINT')?.();

    expect(exitSpy).toHaveBeenCalledWith(130);
  });

  it('should use the SIGTERM exit code on SIGTERM', () => {
    service.listenToShutdownSignals();

    signalListeners.get('SIGTERM')?.();

    expect(service.isShutdownRequested()).toBe(true);
    expect(process.exitCode).toBe(143);
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('should force an immediate exit when a second signal of another kind arrives', () => {
    service.listenToShutdownSignals();

    signalListeners.get('SIGTERM')?.();
    signalListeners.get('SIGINT')?.();

    expect(exitSpy).toHaveBeenCalledWith(130);
  });
});
