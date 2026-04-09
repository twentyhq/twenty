resource "kubernetes_persistent_volume_claim" "server" {
  metadata {
    name      = "${var.twentycrm_app_name}-server-pvc"
    namespace = kubernetes_namespace.twentycrm.metadata.0.name
  }
  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = {
        storage = var.twentycrm_server_pvc_requests
      }
    }
    volume_name = kubernetes_persistent_volume.server.metadata.0.name
  }
}
