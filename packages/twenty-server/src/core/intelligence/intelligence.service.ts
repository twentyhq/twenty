import { Injectable } from '@nestjs/common';

@Injectable()
export class IntelligenceService {
  constructor() {
    // TODO
  }

  async generateSchema(request: Request) {
    return request.body;
  }
}
