import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class WorkspaceQueryListener {
  @OnEvent('updateOne')
  handleUpdateOneEvent(data: any) {
    console.log('Event received for updateOne:', data);
  }

  @OnEvent('deleteOne')
  handleDeleteOneEvent(data: any) {
    console.log('Event received for deleteOne:', data);
  }

  @OnEvent('createMany')
  handleCreateManyEvent(data: any) {
    console.log('Event received for createMany:', data);
  }

  @OnEvent('udpateMany')
  handleUdpateManyEvent(data: any) {
    console.log('Event received for udpateMany:', data);
  }

  @OnEvent('deleteMany')
  handleDeleteManyEvent(data: any) {
    console.log('Event received for deleteMany:', data);
  }
}
