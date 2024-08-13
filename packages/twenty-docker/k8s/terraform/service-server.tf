resource "kubernetes_service" "twentycrm_server" {
  metadata {
    name      = "${var.twentycrm_app_name}-server"
    namespace = kubernetes_namespace.twentycrm.metadata.0.name
  }
  spec {
    selector = {
      app = "${var.twentycrm_app_name}-server"
    }
    session_affinity = "ClientIP"
    port {
      name        = "http-tcp"
      port        = 3000
      target_port = 3000
    }

    type = "ClusterIP"
  }
}
