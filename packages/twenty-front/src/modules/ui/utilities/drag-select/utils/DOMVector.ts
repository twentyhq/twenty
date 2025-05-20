export class DOMVector {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly magnitudeX: number,
    public readonly magnitudeY: number,
  ) {}

  toTerminalPoint(): DOMPoint {
    return new DOMPoint(this.x + this.magnitudeX, this.y + this.magnitudeY);
  }
}
